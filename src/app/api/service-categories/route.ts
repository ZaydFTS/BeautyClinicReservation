import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

// GET /api/service-categories - public list
export async function GET() {
  const categories = await db.serviceCategory.findMany({
    include: { _count: { select: { services: true } } },
    orderBy: { name: "asc" },
  })
  return NextResponse.json({ categories })
}

// POST /api/service-categories - admin only
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, color } = body
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }
  try {
    const cat = await db.serviceCategory.create({
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
