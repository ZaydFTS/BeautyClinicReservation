import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { startTime, endTime, capacity, status, note, serviceId } = body

  const slot = await db.slot.update({
    where: { id },
    data: {
      ...(serviceId !== undefined && { serviceId }),
      ...(startTime !== undefined && { startTime: new Date(startTime) }),
      ...(endTime !== undefined && { endTime: new Date(endTime) }),
      ...(capacity !== undefined && { capacity }),
      ...(status !== undefined && { status }),
      ...(note !== undefined && { note }),
    },
  })
  return NextResponse.json({ slot })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Cannot delete slot with active appointment
  const hasAppt = await db.appointment.findFirst({
    where: { slotId: id, status: "BOOKED" },
  })
  if (hasAppt) {
    return NextResponse.json(
      { error: "Cannot delete slot with an active booking. Cancel the appointment first." },
      { status: 400 }
    )
  }
  await db.slot.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
