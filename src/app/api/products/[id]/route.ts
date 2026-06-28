import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  })
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const {
    name, description, price, cost, stock, lowStockAt,
    imageUrl, categoryId, active,
  } = body

  const product = await db.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(cost !== undefined && { cost }),
      ...(stock !== undefined && { stock }),
      ...(lowStockAt !== undefined && { lowStockAt }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(active !== undefined && { active }),
    },
    include: { category: true },
  })
  return NextResponse.json({ product })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Soft delete by deactivating if there are orders, else hard delete
  const hasOrders = await db.orderItem.count({ where: { productId: id } })
  if (hasOrders > 0) {
    const p = await db.product.update({ where: { id }, data: { active: false } })
    return NextResponse.json({ product: p, deactivated: true })
  }
  await db.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
