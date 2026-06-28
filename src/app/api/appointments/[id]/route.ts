import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const appt = await db.appointment.findUnique({
    where: { id },
    include: { customer: true, service: true, slot: true },
  })
  if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ appointment: appt })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Cancel the appointment (don't delete - keep history)
  const appt = await db.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { slot: true },
  })

  // Mark associated transaction as cancelled
  await db.transaction.updateMany({
    where: { refId: id, type: "APPOINTMENT" },
    data: { status: "CANCELLED" },
  })

  return NextResponse.json({ appointment: appt })
}
