import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"
import {
  startOfDay, endOfDay, startOfMonth, endOfMonth, addDays,
} from "@/lib/format"

// GET /api/dashboard
// Returns: revenue overview, today's appointments, today's orders, low stock alerts
export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const yesterdayStart = startOfDay(addDays(now, -1))
  const yesterdayEnd = endOfDay(addDays(now, -1))
  const last7Start = startOfDay(addDays(now, -6))

  // Today's appointments
  const todayAppointments = await db.appointment.findMany({
    where: {
      slot: { startTime: { gte: todayStart, lte: todayEnd } },
      status: { in: ["BOOKED", "COMPLETED"] },
    },
    include: { customer: true, service: true, slot: true },
    orderBy: { slot: { startTime: "asc" } },
  })

  // Today's orders
  const todayOrders = await db.order.findMany({
    where: { createdAt: { gte: todayStart, lte: todayEnd } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })

  // Revenue: today (completed transactions)
  const todayRevenueRows = await db.transaction.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: todayStart, lte: todayEnd },
    },
  })
  const todayRevenue = todayRevenueRows.reduce((s, t) => s + t.amount, 0)

  // Yesterday revenue (for delta)
  const yesterdayRevenueRows = await db.transaction.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
    },
  })
  const yesterdayRevenue = yesterdayRevenueRows.reduce((s, t) => s + t.amount, 0)

  // Month revenue
  const monthRevenueRows = await db.transaction.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: monthStart, lte: monthEnd },
    },
  })
  const monthRevenue = monthRevenueRows.reduce((s, t) => s + t.amount, 0)

  // Last 7 days revenue series (for chart)
  const last7Rows = await db.transaction.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: last7Start },
    },
  })
  const last7Series: { date: string; label: string; total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = addDays(now, -i)
    const ds = startOfDay(d)
    const de = endOfDay(d)
    const total = last7Rows
      .filter((r) => r.createdAt >= ds && r.createdAt <= de)
      .reduce((s, t) => s + t.amount, 0)
    last7Series.push({
      date: ds.toISOString(),
      label: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
      total,
    })
  }

  // Pending revenue (not yet completed) — scoped to current month
  const pendingRows = await db.transaction.findMany({
    where: {
      status: "PENDING",
      createdAt: { gte: monthStart, lte: monthEnd },
    },
  })
  const pendingRevenue = pendingRows.reduce((s, t) => s + t.amount, 0)

  // Low stock
  const allProducts = await db.product.findMany({
    where: { active: true },
  })
  const lowStock = allProducts
    .filter((p) => p.stock <= p.lowStockAt)
    .sort((a, b) => a.stock - b.stock)

  // Service breakdown (current month)
  const completedApptsThisMonth = await db.appointment.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: monthStart, lte: monthEnd },
    },
    include: { service: true },
  })
  const serviceBreakdown = new Map<string, { name: string; total: number; count: number }>()
  for (const a of completedApptsThisMonth) {
    const k = a.serviceId
    const existing = serviceBreakdown.get(k) || { name: a.service.name, total: 0, count: 0 }
    existing.total += a.price
    existing.count += 1
    serviceBreakdown.set(k, existing)
  }

  // Total counts
  const totalCustomers = await db.customer.count()
  const totalAppointments = await db.appointment.count()
  const totalOrders = await db.order.count()
  const totalProducts = await db.product.count()

  return NextResponse.json({
    todayAppointments,
    todayOrders,
    revenue: {
      today: todayRevenue,
      yesterday: yesterdayRevenue,
      month: monthRevenue,
      pending: pendingRevenue,
      deltaTodayVsYesterday: yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : todayRevenue > 0 ? 100 : 0,
    },
    last7Series,
    lowStock,
    serviceBreakdown: Array.from(serviceBreakdown.values()).sort((a, b) => b.total - a.total),
    counts: {
      customers: totalCustomers,
      appointments: totalAppointments,
      orders: totalOrders,
      products: totalProducts,
    },
  })
}
