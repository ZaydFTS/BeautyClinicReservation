import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const products = await db.product.findMany({
    where: {
      active: true,
      stock: { lte: db.product.fields.lowStockAt },
    },
    include: { category: true },
    orderBy: { stock: "asc" },
  })

  // Use raw filter since SQLite doesn't support the comparison above on column-to-column
  const all = await db.product.findMany({
    where: { active: true },
    include: { category: true },
  })
  const lowStock = all.filter((p) => p.stock <= p.lowStockAt).sort((a, b) => a.stock - b.stock)

  return NextResponse.json({ products: lowStock })
}
