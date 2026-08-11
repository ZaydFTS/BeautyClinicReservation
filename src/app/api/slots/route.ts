import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"
import { SLOT_STATUS } from "@/lib/constants"
import { startOfDay, endOfDay, addDays } from "@/lib/format"

// GET /api/slots?serviceId=xxx&date=YYYY-MM-DD  - public (only AVAILABLE)
// GET /api/slots?from=ISO&to=ISO  - admin (all)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const admin = await getCurrentAdmin()

  const serviceId = searchParams.get("serviceId") || undefined
  const dateStr = searchParams.get("date")
  const fromStr = searchParams.get("from")
  const toStr = searchParams.get("to")

  let start: Date
  let end: Date

  if (dateStr) {
    const d = new Date(dateStr + "T00:00:00")
    start = startOfDay(d)
    end = endOfDay(d)
  } else if (fromStr && toStr) {
    start = new Date(fromStr)
    end = new Date(toStr)
  } else {
    // default: today + next 14 days
    start = startOfDay(new Date())
    end = endOfDay(addDays(new Date(), 14))
  }

  const where: Record<string, unknown> = {
    startTime: { gte: start },
    endTime: { lte: end },
  }
  if (serviceId) where.serviceId = serviceId
  // Public users only see AVAILABLE slots
  if (!admin) where.status = SLOT_STATUS.AVAILABLE

  const slots = await db.slot.findMany({
    where,
    include: {
      service: true,
      appointments: {
        where: { status: "BOOKED" },
        include: { customer: true, service: true, slot: true },
      },
    },
    orderBy: { startTime: "asc" },
  })

  // For public users, hide slots that already have a booking
  // (slot.status remains AVAILABLE even after booking, but capacity is 1)
  if (!admin) {
    return NextResponse.json({
      slots: slots.filter((s) => s.appointments.length < s.capacity),
    })
  }

  return NextResponse.json({ slots })
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { serviceId, startTime, endTime, capacity, status, note } = body
  if (!serviceId || !startTime || !endTime) {
    return NextResponse.json({ error: "serviceId, startTime, endTime required" }, { status: 400 })
  }
  const slot = await db.slot.create({
    data: {
      serviceId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      capacity: typeof capacity === "number" ? capacity : 1,
      status: status || SLOT_STATUS.AVAILABLE,
      note: note || null,
    },
  })
  return NextResponse.json({ slot })
}
