import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

// GET /api/site-settings - public list of all settings
export async function GET() {
  const settings = await db.clinicSetting.findMany()
  // Return as a key-value object for easy consumption
  const obj: Record<string, string> = {}
  for (const s of settings) {
    obj[s.key] = s.value
  }
  return NextResponse.json({ settings: obj })
}

// PUT /api/site-settings - admin only, bulk update
export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { settings } = body as { settings: Record<string, string> }

  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "settings object is required" }, { status: 400 })
  }

  // Upsert each setting
  const operations = Object.entries(settings).map(([key, value]) =>
    db.clinicSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  )

  await db.$transaction(operations)

  // Return the updated settings
  const all = await db.clinicSetting.findMany()
  const obj: Record<string, string> = {}
  for (const s of all) {
    obj[s.key] = s.value
  }
  return NextResponse.json({ settings: obj })
}
