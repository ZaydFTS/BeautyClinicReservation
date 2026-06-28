import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const svc = await db.service.findUnique({ where: { id } })
  if (!svc) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ service: svc })
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, description, price, durationMin, category, active } = body
  const svc = await db.service.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(durationMin !== undefined && { durationMin }),
      ...(category !== undefined && { category }),
      ...(active !== undefined && { active }),
    },
  })
  return NextResponse.json({ service: svc })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Soft delete by deactivating if there are dependencies, else hard delete
  const hasAppts = await db.appointment.count({ where: { serviceId: id } })
  const hasSlots = await db.slot.count({ where: { serviceId: id } })
  if (hasAppts > 0 || hasSlots > 0) {
    const svc = await db.service.update({ where: { id }, data: { active: false } })
    return NextResponse.json({ service: svc, deactivated: true })
  }
  await db.service.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
