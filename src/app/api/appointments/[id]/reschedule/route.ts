// Reschedule appointment to a different slot (drag & drop support)
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"
import { SLOT_STATUS, APPOINTMENT_STATUS } from "@/lib/constants"

type Ctx = { params: Promise<{ id: string }> }

// PATCH /api/appointments/[id]/reschedule
// Body: { newSlotId: string }
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { newSlotId } = body
  if (!newSlotId) return NextResponse.json({ error: "newSlotId required" }, { status: 400 })

  const result = await db.$transaction(async (tx) => {
    const appt = await tx.appointment.findUnique({
      where: { id },
      include: { slot: true },
    })
    if (!appt) throw new Error("Appointment not found")
    if (appt.status === APPOINTMENT_STATUS.CANCELLED) {
      throw new Error("Cannot reschedule a cancelled appointment")
    }

    const newSlot = await tx.slot.findUnique({
      where: { id: newSlotId },
      include: {
        appointments: { where: { status: APPOINTMENT_STATUS.BOOKED } },
        service: true,
      },
    })
    if (!newSlot) throw new Error("Target slot not found")
    if (newSlot.status !== SLOT_STATUS.AVAILABLE) {
      throw new Error("Target slot is not available")
    }
    if (newSlot.appointments.some((a) => a.id !== appt.id)) {
      throw new Error("Target slot is already booked")
    }
    if (newSlot.serviceId !== appt.serviceId) {
      throw new Error("Target slot must be for the same service")
    }

    // Move the appointment
    const updated = await tx.appointment.update({
      where: { id },
      data: { slotId: newSlotId },
      include: { slot: true, service: true, customer: true },
    })

    return updated
  })

  return NextResponse.json({ appointment: result })
}
