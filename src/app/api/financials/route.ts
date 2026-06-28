import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"
import {
  startOfDay, endOfDay, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addDays,
} from "@/lib/format"

// GET /api/financials?range=today|week|month|all
// GET /api/financials?from=ISO&to=ISO
export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") || "month"
  const fromStr = searchParams.get("from")
  const toStr = searchParams.get("to")

  const now = new Date()
  let start: Date
  let end: Date

  if (fromStr && toStr) {
    start = new Date(fromStr)
    end = new Date(toStr)
  } else if (range === "today") {
    start = startOfDay(now); end = endOfDay(now)
  } else if (range === "week") {
    start = startOfWeek(now); end = endOfWeek(now)
  } else if (range === "month") {
    start = startOfMonth(now); end = endOfMonth(now)
  } else {
    start = new Date(0); end = new Date()
  }

  const txs = await db.transaction.findMany({
    where: { createdAt: { gte: start, lte: end } },
    orderBy: { createdAt: "desc" },
  })

  const total = txs.filter((t) => t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0)
  const pending = txs.filter((t) => t.status === "PENDING").reduce((s, t) => s + t.amount, 0)
  const cancelled = txs.filter((t) => t.status === "CANCELLED").reduce((s, t) => s + t.amount, 0)

  const byType: Record<string, { completed: number; pending: number; count: number }> = {}
  for (const t of txs) {
    const k = t.type
    byType[k] = byType[k] || { completed: 0, pending: 0, count: 0 }
    if (t.status === "COMPLETED") byType[k].completed += t.amount
    if (t.status === "PENDING") byType[k].pending += t.amount
    byType[k].count += 1
  }

  // Daily breakdown for chart
  const days = Math.min(
    90,
    Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)))
  )
  const series: { date: string; label: string; total: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(end, -i)
    const ds = startOfDay(d); const de = endOfDay(d)
    const total = txs
      .filter((t) => t.status === "COMPLETED" && t.createdAt >= ds && t.createdAt <= de)
      .reduce((s, t) => s + t.amount, 0)
    series.push({
      date: ds.toISOString(),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total,
    })
  }

  return NextResponse.json({
    range: { start: start.toISOString(), end: end.toISOString() },
    total,
    pending,
    cancelled,
    byType,
    series,
    transactions: txs.slice(0, 100),
  })
}
