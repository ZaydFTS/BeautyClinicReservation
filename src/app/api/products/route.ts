import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

// GET /api/products?active=true - public (only active)
// GET /api/products - admin (all)
// GET /api/products?page=1&limit=9 - paginated (server-side)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const admin = await getCurrentAdmin()
  const categoryId = searchParams.get("categoryId") || undefined
  const q = searchParams.get("q") || undefined
  const pageParam = searchParams.get("page")
  const limitParam = searchParams.get("limit")

  const where: Record<string, unknown> = {}
  if (!admin) where.active = true
  if (categoryId) where.categoryId = categoryId
  if (q) where.name = { contains: q }

  // Sort mapping
  const sort = searchParams.get("sort") || "featured"
  const orderBy: Record<string, string> = {
    featured: "createdAt",
    "price-asc": "price",
    "price-desc": "price",
    name: "name",
  }
  const sortField = orderBy[sort] || "createdAt"
  const sortDir = sort === "price-desc" ? "desc" : sort === "name" ? "asc" : sort === "price-asc" ? "asc" : "desc"

  // Server-side pagination (only when page param is provided)
  if (pageParam) {
    const page = Math.max(1, parseInt(pageParam) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(limitParam) || 9))
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy: { [sortField]: sortDir },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  }

  // No pagination — return all (backward compatible)
  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy: { [sortField]: sortDir },
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
