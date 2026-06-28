import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

// GET /api/services?active=true - public list (only active)
// GET /api/services?includeInactive=1 - admin only
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const includeInactive = searchParams.get("includeInactive") === "1"
  const onlyActive = searchParams.get("active") === "true"

  const admin = await getCurrentAdmin()

  const where: Record<string, unknown> = {}
  if (onlyActive || !admin) where.active = true
  if (includeInactive && admin) {
    // admin can see all
  }

  const services = await db.service.findMany({
    where,
    orderBy: [{ category: "asc" }, { price: "asc" }],
  })
  return NextResponse.json({ services })
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, description, price, durationMin, category, active } = body
    if (!name || typeof price !== "number" || typeof durationMin !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const svc = await db.service.create({
      data: {
        name,
        description: description || null,
        price,
        durationMin,
        category: category || "Other",
        active: active ?? true,
      },
    })
    return NextResponse.json({ service: svc })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
