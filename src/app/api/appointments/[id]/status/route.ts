import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

// PATCH /api/appointments/[id]/status
// Body: { status: "BOOKED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" }
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { status } = body
  const valid = ["BOOKED", "COMPLETED", "CANCELLED", "NO_SHOW"]
  if (!valid.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const appt = await db.appointment.update({
    where: { id },
    data: { status },
    include: { slot: true, service: true, customer: true },
  })

  // Sync transaction status
  const txStatus = status === "COMPLETED" ? "COMPLETED" : status === "CANCELLED" ? "CANCELLED" : "PENDING"
  await db.transaction.updateMany({
    where: { refId: id, type: "APPOINTMENT" },
    data: { status: txStatus },
  })

  return NextResponse.json({ appointment: appt })
}
