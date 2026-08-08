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

  const services = await db.service.findMany({
    where,
    include: { categoryRef: true },
    orderBy: [{ category: "asc" }, { price: "asc" }],
  })
  return NextResponse.json({ services })
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, nameAr, description, descriptionAr, price, durationMin, category, categoryId, imageUrl, active } = body
    if (!name || typeof price !== "number" || typeof durationMin !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let resolvedCategory = category || "Other"
    let resolvedCategoryId = categoryId || null
    if (categoryId) {
      const cat = await db.serviceCategory.findUnique({ where: { id: categoryId } })
      if (cat) resolvedCategory = cat.name
      else resolvedCategoryId = null
    }

    const svc = await db.service.create({
      data: {
        name,
        nameAr: nameAr?.trim() || null,
        description: description || null,
        descriptionAr: descriptionAr?.trim() || null,
        price,
        durationMin,
        category: resolvedCategory,
        categoryId: resolvedCategoryId,
        imageUrl: imageUrl || null,
        active: active ?? true,
      },
      include: { categoryRef: true },
    })
    return NextResponse.json({ service: svc })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
