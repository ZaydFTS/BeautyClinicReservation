import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, color } = body
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }
  try {
    const cat = await db.serviceCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        color: color?.trim() || null,
      },
      include: { _count: { select: { services: true } } },
    })
    return NextResponse.json({ category: cat })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check if any services use this category
  const count = await db.service.count({ where: { categoryId: id } })
  if (count > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${count} service(s) still use this category. Reassign them first.`,
      },
      { status: 400 }
    )
  }

  await db.serviceCategory.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
