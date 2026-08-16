import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"
// GET /api/home-content
// Returns the single HomePageContent row; creates with defaults if none exists.
export async function GET() {
 let content = await db.homePageContent.findFirst()
 if (!content) {
 content = await db.homePageContent.create({ data: {} })
 }
 return NextResponse.json({ content })
}
// PUT /api/home-content
// Admin-only update of all fields. Accepts partial updates.
export async function PUT(req: NextRequest) {
 try {
 const admin = await getCurrentAdmin()
 if (!admin) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 }
 const body = (await req.json()) as Record<string, unknown>
 const allowed: (keyof typeof db.homePageContent.fields)[] = [
 "heroEyebrow",
 "heroEyebrowAr",
 "heroTitle",
 "heroTitleAr",
 "heroTitleAccent",
 "heroTitleAccentAr",
 "heroSubtitle",
 "heroSubtitleAr",
 "heroMediaType",
 "heroImageUrl",
 "heroVideoUrl",
 "heroStatsNumber",
 "heroStatsLabel",
 "heroStatsLabelAr",
 "heroRating",
 "ctaTitle",
 "ctaTitleAr",
 "ctaSubtitle",
 "ctaSubtitleAr",
 "curatedTitle1",
 "curatedTitle1Ar",
 "curatedTitle2",
 "curatedTitle2Ar",
 "curatedDesc",
 "curatedDescAr",
 ]
 const data: Record<string, unknown> = {}
 for (const key of allowed) {
 if (key in body) {
 const v = body[key]
 // Allow null to clear optional fields, but coerce empty strings to null for optional AR fields
 data[key] = v === "" ? null : v
 }
 }
 let content = await db.homePageContent.findFirst()
 if (!content) {
 content = await db.homePageContent.create({ data })
 } else {
 content = await db.homePageContent.update({
 where: { id: content.id },
 data,
 })
 }
 return NextResponse.json({ content })
 } catch (e) {
 const msg = e instanceof Error ? e.message : String(e)
 return NextResponse.json({ error: msg }, { status: 500 })
 }
}