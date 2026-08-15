// Telegram Bot command handlers
// Supports: /start, /help, /today, /tomorrow, /today_appointments, /today_orders,
//           /tomorrow_appointments, /tomorrow_orders, /stats
//
// All commands are restricted to the configured admin chat ID.

import { db } from "@/lib/db"
import {
  startOfDay, endOfDay, addDays, formatTime, formatDateTime, formatMoney,
} from "@/lib/format"
import {
  APPOINTMENT_STATUS_LABEL, ORDER_STATUS_LABEL,
} from "@/lib/constants"

// ============================================================================
// Telegram Bot API helpers
// ============================================================================

function getTelegramConfig() {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || "",
  }
}

// Telegram MarkdownV2 escape
function escapeMd(s: string): string {
  return s.replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, "\\$1")
}

async function tgSendMessage(chatId: string, text: string) {
  const { botToken } = getTelegramConfig()
  if (!botToken) return { ok: false, error: "no bot token" }
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    return { ok: false, error: t }
  }
  return { ok: true }
}

// ============================================================================
// Command handlers
// ============================================================================

export type CommandResult = { ok: boolean; error?: string }

export async function handleCommand(
  command: string,
  args: string[],
  chatId: string
): Promise<CommandResult> {
  const { adminChatId } = getTelegramConfig()
  if (!adminChatId) {
    return { ok: false, error: "admin chat id not configured" }
  }
  // Restrict to admin chat
  if (chatId !== adminChatId) {
    await tgSendMessage(
      chatId,
      escapeMd("⛔ Unauthorized. This bot is restricted to clinic administrators.")
    )
    return { ok: false, error: "unauthorized chat" }
  }

  const cmd = command.toLowerCase().replace(/^\//, "")
  try {
    switch (cmd) {
      case "start":
        await sendHelp(chatId, "Welcome to R&R Beauty Clinic Bot! 🌸")
        return { ok: true }
      case "help":
        await sendHelp(chatId)
        return { ok: true }
      case "today":
        await sendTodaySummary(chatId)
        return { ok: true }
      case "tomorrow":
        await sendTomorrowSummary(chatId)
        return { ok: true }
      case "today_appointments":
      case "today_appts":
        await sendAppointmentsFor(chatId, 0)
        return { ok: true }
      case "today_orders":
        await sendOrdersFor(chatId, 0)
        return { ok: true }
      case "tomorrow_appointments":
      case "tomorrow_appts":
        await sendAppointmentsFor(chatId, 1)
        return { ok: true }
      case "tomorrow_orders":
        await sendOrdersFor(chatId, 1)
        return { ok: true }
      case "stats":
        await sendStats(chatId)
        return { ok: true }
      default:
        await tgSendMessage(
          chatId,
          escapeMd(`Unknown command: /${cmd}\n\nType /help to see available commands.`)
        )
        return { ok: true }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await tgSendMessage(chatId, escapeMd(`⚠️ Error: ${msg}`))
    return { ok: false, error: msg }
  }
}

// ============================================================================
// /help
// ============================================================================

async function sendHelp(chatId: string, intro?: string) {
  const lines: string[] = []
  if (intro) lines.push(escapeMd(intro), "")
  lines.push(escapeMd("📋 Available commands:"))
  lines.push("")
  lines.push(escapeMd("📅 /today — Today's appointments + orders (combined)"))
  lines.push(escapeMd("📆 /tomorrow — Tomorrow's appointments + orders (reminder)"))
  lines.push("")
  lines.push(escapeMd("Granular commands:"))
  lines.push(escapeMd("• /today_appointments — Today's appointments only"))
  lines.push(escapeMd("• /today_orders — Today's orders only"))
  lines.push(escapeMd("• /tomorrow_appointments — Tomorrow's appointments only"))
  lines.push(escapeMd("• /tomorrow_orders — Tomorrow's orders only"))
  lines.push("")
  lines.push(escapeMd("📊 /stats — Quick revenue & count summary"))
  lines.push(escapeMd("❓ /help — Show this help message"))
  await tgSendMessage(chatId, lines.join("\n"))
}

// ============================================================================
// /today and /tomorrow (combined)
// ============================================================================

async function sendTodaySummary(chatId: string) {
  const date = new Date()
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })

  const lines: string[] = []
  lines.push(`*${escapeMd("📅 TODAY'S SUMMARY")}*`)
  lines.push(escapeMd(dateLabel))
  lines.push("")

  const apptSection = await fetchAppointmentsText(0)
  lines.push(...apptSection)
  lines.push("")

  const orderSection = await fetchOrdersText(0)
  lines.push(...orderSection)

  await tgSendMessage(chatId, lines.join("\n"))
}

async function sendTomorrowSummary(chatId: string) {
  const date = addDays(new Date(), 1)
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })

  const lines: string[] = []
  lines.push(`*${escapeMd("📆 TOMORROW'S REMINDER")}*`)
  lines.push(escapeMd(dateLabel))
  lines.push("")

  const apptSection = await fetchAppointmentsText(1)
  lines.push(...apptSection)
  lines.push("")

  const orderSection = await fetchOrdersText(1)
  lines.push(...orderSection)

  await tgSendMessage(chatId, lines.join("\n"))
}

// ============================================================================
// /today_appointments, /tomorrow_appointments
// ============================================================================

async function sendAppointmentsFor(chatId: string, dayOffset: number) {
  const date = addDays(new Date(), dayOffset)
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })
  const title = dayOffset === 0 ? "📅 TODAY'S APPOINTMENTS" : "📆 TOMORROW'S APPOINTMENTS"

  const lines: string[] = []
  lines.push(`*${escapeMd(title)}*`)
  lines.push(escapeMd(dateLabel))
  lines.push("")
  const section = await fetchAppointmentsText(dayOffset)
  lines.push(...section)

  await tgSendMessage(chatId, lines.join("\n"))
}

// ============================================================================
// /today_orders, /tomorrow_orders
// ============================================================================

async function sendOrdersFor(chatId: string, dayOffset: number) {
  const date = addDays(new Date(), dayOffset)
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })
  const title = dayOffset === 0 ? "🛒 TODAY'S ORDERS" : "🛒 TOMORROW'S ORDERS"

  const lines: string[] = []
  lines.push(`*${escapeMd(title)}*`)
  lines.push(escapeMd(dateLabel))
  lines.push("")
  const section = await fetchOrdersText(dayOffset)
  lines.push(...section)

  await tgSendMessage(chatId, lines.join("\n"))
}

// ============================================================================
// /stats
// ============================================================================

async function sendStats(chatId: string) {
  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())

  const todayAppts = await db.appointment.findMany({
    where: {
      slot: { startTime: { gte: todayStart, lte: todayEnd } },
      status: { in: ["BOOKED", "COMPLETED"] },
    },
    include: { service: true, slot: true },
  })
  const todayOrders = await db.order.findMany({
    where: { createdAt: { gte: todayStart, lte: todayEnd } },
  })

  const todayRevenueRows = await db.transaction.findMany({
    where: { status: "COMPLETED", createdAt: { gte: todayStart, lte: todayEnd } },
  })
  const todayRevenue = todayRevenueRows.reduce((s, t) => s + t.amount, 0)

  const pendingAppts = todayAppts.filter((a) => a.status === "BOOKED").length
  const completedAppts = todayAppts.filter((a) => a.status === "COMPLETED").length

  // Low stock count
  const allProducts = await db.product.findMany({ where: { active: true } })
  const lowStock = allProducts.filter((p) => p.stock <= p.lowStockAt).length

  const lines: string[] = []
  lines.push(`*${escapeMd("📊 CLINIC STATS")}*`)
  lines.push(escapeMd(new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })))
  lines.push("")
  lines.push(escapeMd(`💰 Revenue today: ${formatMoney(todayRevenue)}`))
  lines.push(escapeMd(`📅 Appointments: ${todayAppts.length} total (${pendingAppts} pending, ${completedAppts} completed)`))
  lines.push(escapeMd(`🛒 Orders today: ${todayOrders.length}`))
  lines.push(escapeMd(`⚠️ Low stock alerts: ${lowStock} product(s)`))
  lines.push("")
  lines.push(escapeMd("Use /today or /tomorrow for details."))

  await tgSendMessage(chatId, lines.join("\n"))
}

// ============================================================================
// Data fetchers → text lines
// ============================================================================

async function fetchAppointmentsText(dayOffset: number): Promise<string[]> {
  const baseDate = addDays(new Date(), dayOffset)
  const start = startOfDay(baseDate)
  const end = endOfDay(baseDate)

  const appts = await db.appointment.findMany({
    where: {
      slot: { startTime: { gte: start, lte: end } },
      status: { in: ["BOOKED", "COMPLETED"] },
    },
    include: { customer: true, service: true, slot: true },
    orderBy: { slot: { startTime: "asc" } },
  })

  const lines: string[] = []
  lines.push(`*${escapeMd("📅 APPOINTMENTS")}*`)
  lines.push(escapeMd(`Total: ${appts.length} appointment(s)`))

  if (appts.length === 0) {
    lines.push(escapeMd("No appointments scheduled."))
    return lines
  }

  lines.push("")
  appts.forEach((a, i) => {
    const num = i + 1
    const time = formatTime(a.slot.startTime)
    const status = APPOINTMENT_STATUS_LABEL[a.status] || a.status
    lines.push(`${escapeMd(`${num}. ${time}`)} \\- ${escapeMd(a.service.name)}`)
    lines.push(`   👤 ${escapeMd(a.customer.name)} · ${escapeMd(a.customer.phone)}`)
    lines.push(`   💵 ${escapeMd(formatMoney(a.price))} · ${escapeMd(status)}`)
  })

  return lines
}

async function fetchOrdersText(dayOffset: number): Promise<string[]> {
  const baseDate = addDays(new Date(), dayOffset)
  const start = startOfDay(baseDate)
  const end = endOfDay(baseDate)

  const orders = await db.order.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  })

  const lines: string[] = []
  lines.push(`*${escapeMd("🛒 ORDERS")}*`)
  const totalAmount = orders.reduce((s, o) => s + o.total, 0)
  lines.push(escapeMd(`Total: ${orders.length} order(s) · ${formatMoney(totalAmount)}`))

  if (orders.length === 0) {
    lines.push(escapeMd("No orders received."))
    return lines
  }

  lines.push("")
  orders.forEach((o, i) => {
    const num = i + 1
    const short = o.id.slice(-8).toUpperCase()
    const status = ORDER_STATUS_LABEL[o.status] || o.status
    const itemCount = o.items.reduce((s, it) => s + it.quantity, 0)
    lines.push(`${escapeMd(`${num}. #${short}`)} · ${escapeMd(o.customerName)}`)
    lines.push(`   📦 ${escapeMd(`${itemCount} item(s)`)} · ${escapeMd(formatMoney(o.total))} · ${escapeMd(status)}`)
  })

  return lines
}
