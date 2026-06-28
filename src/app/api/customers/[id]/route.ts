import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      appointments: {
        include: { service: true, slot: true },
        orderBy: { slot: { startTime: "desc" } },
      },
      orders: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ customer })
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, phone, email, notes } = body
  const updated = await db.customer.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(notes !== undefined && { notes }),
    },
  })
  return NextResponse.json({ customer: updated })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await db.customer.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
