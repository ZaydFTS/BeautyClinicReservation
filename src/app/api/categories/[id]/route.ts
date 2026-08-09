import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name } = body
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  const cat = await db.productCategory.update({
    where: { id },
    data: { name: name.trim() },
    include: { _count: { select: { products: true } } },
  })
  return NextResponse.json({ category: cat })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const productCount = await db.product.count({ where: { categoryId: id } })
  if (productCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${productCount} products are using this category. Reassign them first.` },
      { status: 409 }
    )
  }

  await db.productCategory.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
