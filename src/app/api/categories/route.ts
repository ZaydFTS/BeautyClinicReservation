import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const categories = await db.productCategory.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })
  const cat = await db.productCategory.create({ data: { name } })
  return NextResponse.json({ category: cat })
}
