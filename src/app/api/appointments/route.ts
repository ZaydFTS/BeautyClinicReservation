import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifyNewAppointment } from "@/lib/telegram"
import { SLOT_STATUS, APPOINTMENT_STATUS } from "@/lib/constants"
import { startOfDay, endOfDay, addDays } from "@/lib/format"

// GET /api/appointments?from=ISO&to=ISO  - admin: all appointments in range
// GET /api/appointments?today=1         - admin: today's appointments
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fromStr = searchParams.get("from")
  const toStr = searchParams.get("to")
  const today = searchParams.get("today") === "1"
  const customerId = searchParams.get("customerId") || undefined

  let start: Date
  let end: Date

  if (today) {
    start = startOfDay(new Date())
    end = endOfDay(new Date())
  } else if (fromStr && toStr) {
    start = new Date(fromStr)
    end = new Date(toStr)
  } else {
    start = startOfDay(new Date())
    end = endOfDay(addDays(new Date(), 30))
  }

  const where: Record<string, unknown> = {
    slot: { startTime: { gte: start, lte: end } },
  }
  if (customerId) where.customerId = customerId

  const appts = await db.appointment.findMany({
    where,
    include: {
      customer: true,
      service: true,
      slot: true,
    },
    orderBy: { slot: { startTime: "asc" } },
  })
  return NextResponse.json({ appointments: appts })
}

// POST /api/appointments - customer creates a booking
// Body: { slotId, customerName, phone, email, note }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slotId, customerName, phone, email, note } = body
    if (!slotId || !customerName || !phone) {
      return NextResponse.json(
        { error: "slotId, customerName, phone are required" },
        { status: 400 }
      )
    }

    // Use a transaction to prevent double booking
    const result = await db.$transaction(async (tx) => {
      const slot = await tx.slot.findUnique({
        where: { id: slotId },
        include: {
          service: true,
          appointments: { where: { status: APPOINTMENT_STATUS.BOOKED } },
        },
      })

      if (!slot) throw new Error("Slot not found")
      if (slot.status !== SLOT_STATUS.AVAILABLE) {
        throw new Error("This slot is no longer available")
      }
      if (slot.appointments.length >= slot.capacity) {
        throw new Error("This slot is already booked")
      }
      if (new Date(slot.startTime) < new Date()) {
        throw new Error("This slot is in the past")
      }

      // Find or create customer by phone
      let customer = await tx.customer.findFirst({ where: { phone } })
      if (!customer) {
        customer = await tx.customer.create({
          data: { name: customerName, phone, email: email || null },
        })
      } else {
        // Update name/email if changed
        if (customer.name !== customerName || (email && customer.email !== email)) {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: { name: customerName, email: email || customer.email },
          })
        }
      }

      const appt = await tx.appointment.create({
        data: {
          customerId: customer.id,
          serviceId: slot.serviceId,
          slotId: slot.id,
          status: APPOINTMENT_STATUS.BOOKED,
          price: slot.service.price,
          note: note || null,
        },
        include: { service: true, slot: true, customer: true },
      })

      await tx.transaction.create({
        data: {
          type: "APPOINTMENT",
          amount: slot.service.price,
          status: "PENDING",
          refId: appt.id,
          refKind: "Appointment",
          description: `Appointment: ${slot.service.name}`,
          customerId: customer.id,
        },
      })

      return appt
    })

    // Fire-and-forget notification (do not block response)
    notifyNewAppointment({
      customerName: result.customer.name,
      serviceName: result.service.name,
      when: `${result.slot.startTime.toISOString()}`,
      phone: result.customer.phone,
    }).catch(() => {})

    return NextResponse.json({ appointment: result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const status = msg.includes("not found") || msg.includes("no longer") || msg.includes("already booked") || msg.includes("past")
      ? 409
      : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
