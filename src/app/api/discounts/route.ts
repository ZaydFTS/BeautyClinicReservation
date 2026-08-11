import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

// Discount config structure:
// {
//   enabled: boolean,
//   scope: "all_services" | "all_products" | "all" | "service_category" | "product_category",
//   targetType: "service" | "product",
//   categoryId: string | null,   // when scope is a specific category
//   percent: number,             // 0-100
//   label: string,               // e.g. "Summer Sale"
//   labelAr: string,
// }

const DISCOUNT_KEY = "discount_config"

const DEFAULT_CONFIG = {
  enabled: false,
  scope: "all",
  targetType: "all",
  categoryId: null as string | null,
  percent: 0,
  label: "",
  labelAr: "",
}

// GET /api/discounts - public (returns active discount config)
export async function GET() {
  const row = await db.clinicSetting.findUnique({ where: { key: DISCOUNT_KEY } })
  if (!row) {
    return NextResponse.json({ discount: DEFAULT_CONFIG })
  }
  try {
    const parsed = JSON.parse(row.value)
    return NextResponse.json({ discount: { ...DEFAULT_CONFIG, ...parsed } })
  } catch {
    return NextResponse.json({ discount: DEFAULT_CONFIG })
  }
}

// PUT /api/discounts - admin only
export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const config = {
    enabled: !!body.enabled,
    scope: body.scope || "all",
    targetType: body.targetType || "all",
    categoryId: body.categoryId || null,
    percent: Math.max(0, Math.min(100, Number(body.percent) || 0)),
    label: (body.label || "").trim(),
    labelAr: (body.labelAr || "").trim(),
  }

  await db.clinicSetting.upsert({
    where: { key: DISCOUNT_KEY },
    update: { value: JSON.stringify(config) },
    create: { key: DISCOUNT_KEY, value: JSON.stringify(config) },
  })

  return NextResponse.json({ discount: config })
}
