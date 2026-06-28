import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const logs = await db.notificationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json({ logs })
}
