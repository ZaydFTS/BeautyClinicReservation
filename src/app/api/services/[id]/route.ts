import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const svc = await db.service.findUnique({
    where: { id },
    include: { categoryRef: true },
  })
  if (!svc) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ service: svc })
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, nameAr, description, descriptionAr, price, durationMin, category, categoryId, imageUrl, active } = body

  let resolvedCategory: string | undefined = undefined
  if (categoryId !== undefined) {
    if (categoryId) {
      const cat = await db.serviceCategory.findUnique({ where: { id: categoryId } })
      if (cat) resolvedCategory = cat.name
    }
  } else if (category !== undefined) {
    resolvedCategory = category
  }

  const svc = await db.service.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(nameAr !== undefined && { nameAr: nameAr?.trim() || null }),
      ...(description !== undefined && { description }),
      ...(descriptionAr !== undefined && { descriptionAr: descriptionAr?.trim() || null }),
      ...(price !== undefined && { price }),
      ...(durationMin !== undefined && { durationMin }),
      ...(resolvedCategory !== undefined && { category: resolvedCategory }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
      ...(active !== undefined && { active }),
    },
    include: { categoryRef: true },
  })
  return NextResponse.json({ service: svc })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const hasAppts = await db.appointment.count({ where: { serviceId: id } })
  const hasSlots = await db.slot.count({ where: { serviceId: id } })
  if (hasAppts > 0 || hasSlots > 0) {
    const svc = await db.service.update({ where: { id }, data: { active: false } })
    return NextResponse.json({ service: svc, deactivated: true })
  }
  await db.service.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
