// Bulk create slots - admin generates many slots at once
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"
import { SLOT_STATUS } from "@/lib/constants"
import { addDays, toISODate } from "@/lib/format"

interface BulkPayload {
  serviceId: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  daysOfWeek: number[] // 0=Sun ... 6=Sat
  hours: number[] // hours of day e.g. [9, 11, 13, 15, 17]
  slotDurationMin?: number // override service duration
  status?: string
  note?: string
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body: BulkPayload = await req.json()
  const {
    serviceId,
    startDate,
    endDate,
    daysOfWeek,
    hours,
    slotDurationMin,
    status = SLOT_STATUS.AVAILABLE,
    note,
  } = body

  if (!serviceId || !startDate || !endDate || !daysOfWeek?.length || !hours?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const service = await db.service.findUnique({ where: { id: serviceId } })
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 })

  const duration = slotDurationMin || service.durationMin
  const start = new Date(startDate + "T00:00:00")
  const end = new Date(endDate + "T23:59:59")
  const created: { id: string }[] = []

  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    if (!daysOfWeek.includes(d.getDay())) continue

    for (const hour of hours) {
      const slotStart = new Date(d)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + duration)

      // skip past end of working day (7 PM)
      if (slotEnd.getHours() > 19 || (slotEnd.getHours() === 19 && slotEnd.getMinutes() > 0)) {
        continue
      }
      // skip past slots
      if (slotStart < new Date()) continue

      // Check overlap with existing slot for same service
      const overlap = await db.slot.findFirst({
        where: {
          serviceId,
          OR: [
            {
              AND: [
                { startTime: { lte: slotStart } },
                { endTime: { gt: slotStart } },
              ],
            },
            {
              AND: [
                { startTime: { lt: slotEnd } },
                { endTime: { gte: slotEnd } },
              ],
            },
          ],
        },
      })
      if (overlap) continue

      const slot = await db.slot.create({
        data: {
          serviceId,
          startTime: slotStart,
          endTime: slotEnd,
          capacity: 1,
          status,
          note: note || null,
        },
      })
      created.push({ id: slot.id })
    }
  }

  return NextResponse.json({ created: created.length, slots: created })
}
