import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

// GET /api/products?active=true - public (only active, with stock > 0 allowed)
// GET /api/products - admin (all)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const admin = await getCurrentAdmin()
  const categoryId = searchParams.get("categoryId") || undefined
  const q = searchParams.get("q") || undefined

  const where: Record<string, unknown> = {}
  if (!admin) where.active = true
  if (categoryId) where.categoryId = categoryId
  if (q) where.name = { contains: q }

  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const {
    name, description, price, cost, stock, lowStockAt,
    imageUrl, categoryId, active,
  } = body
  if (!name || typeof price !== "number") {
    return NextResponse.json({ error: "name and price required" }, { status: 400 })
  }
  const product = await db.product.create({
    data: {
      name,
      description: description || null,
      price,
      cost: typeof cost === "number" ? cost : 0,
      stock: typeof stock === "number" ? stock : 0,
      lowStockAt: typeof lowStockAt === "number" ? lowStockAt : 5,
      imageUrl: imageUrl || null,
      categoryId: categoryId || null,
      active: active ?? true,
    },
    include: { category: true },
  })
  return NextResponse.json({ product })
}
