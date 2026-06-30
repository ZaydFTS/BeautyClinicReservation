// Telegram Bot long-polling mini-service.
// Use this when you don't have a public HTTPS URL to register a webhook.
//
// Run with: bun run mini-services/telegram-poller/index.ts
//
// Make sure to delete any existing webhook first:
//   bun run scripts/unregister-telegram-webhook.ts

import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || ""

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN must be set in /home/z/my-project/.env")
  process.exit(1)
}
if (!ADMIN_CHAT_ID) {
  console.error("❌ TELEGRAM_ADMIN_CHAT_ID must be set in /home/z/my-project/.env")
  process.exit(1)
}

const API = `https://api.telegram.org/bot${BOT_TOKEN}`

function escapeMd(s: string): string {
  return s.replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, "\\$1")
}

async function tgSendMessage(chatId: string, text: string) {
  const res = await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }),
  })
  return res.json()
}

// ============================================================================
// Date helpers (mirrors src/lib/format.ts)
// ============================================================================
function startOfDay(d: Date): Date {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x
}
function endOfDay(d: Date): Date {
  const x = new Date(d); x.setHours(23, 59, 59, 999); return x
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d); x.setDate(x.getDate() + n); return x
}
function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(d)
}
function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
}

// ============================================================================
// Command handlers (mirror of src/lib/telegram-bot.ts)
// ============================================================================

const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  BOOKED: "Booked", COMPLETED: "Completed", CANCELLED: "Cancelled", NO_SHOW: "No-show",
}
const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending", COMPLETED: "Completed", CANCELLED: "Cancelled",
}

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
    const time = formatTime(a.slot.startTime)
    const status = APPOINTMENT_STATUS_LABEL[a.status] || a.status
    lines.push(`${escapeMd(`${i + 1}. ${time}`)} \\- ${escapeMd(a.service.name)}`)
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
    const short = o.id.slice(-8).toUpperCase()
    const status = ORDER_STATUS_LABEL[o.status] || o.status
    const itemCount = o.items.reduce((s, it) => s + it.quantity, 0)
    lines.push(`${escapeMd(`${i + 1}. #${short}`)} · ${escapeMd(o.customerName)}`)
    lines.push(`   📦 ${escapeMd(`${itemCount} item(s)`)} · ${escapeMd(formatMoney(o.total))} · ${escapeMd(status)}`)
  })
  return lines
}

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

async function sendTodaySummary(chatId: string) {
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })
  const lines: string[] = []
  lines.push(`*${escapeMd("📅 TODAY'S SUMMARY")}*`)
  lines.push(escapeMd(dateLabel))
  lines.push("")
  lines.push(...(await fetchAppointmentsText(0)))
  lines.push("")
  lines.push(...(await fetchOrdersText(0)))
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
  lines.push(...(await fetchAppointmentsText(1)))
  lines.push("")
  lines.push(...(await fetchOrdersText(1)))
  await tgSendMessage(chatId, lines.join("\n"))
}

async function sendStats(chatId: string) {
  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())
  const todayAppts = await db.appointment.findMany({
    where: { slot: { startTime: { gte: todayStart, lte: todayEnd } }, status: { in: ["BOOKED", "COMPLETED"] } },
    include: { service: true, slot: true },
  })
  const todayOrders = await db.order.findMany({ where: { createdAt: { gte: todayStart, lte: todayEnd } } })
  const revRows = await db.transaction.findMany({ where: { status: "COMPLETED", createdAt: { gte: todayStart, lte: todayEnd } } })
  const rev = revRows.reduce((s, t) => s + t.amount, 0)
  const pending = todayAppts.filter((a) => a.status === "BOOKED").length
  const completed = todayAppts.filter((a) => a.status === "COMPLETED").length
  const allProducts = await db.product.findMany({ where: { active: true } })
  const lowStock = allProducts.filter((p) => p.stock <= p.lowStockAt).length

  const lines: string[] = []
  lines.push(`*${escapeMd("📊 CLINIC STATS")}*`)
  lines.push(escapeMd(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })))
  lines.push("")
  lines.push(escapeMd(`💰 Revenue today: ${formatMoney(rev)}`))
  lines.push(escapeMd(`📅 Appointments: ${todayAppts.length} total (${pending} pending, ${completed} completed)`))
  lines.push(escapeMd(`🛒 Orders today: ${todayOrders.length}`))
  lines.push(escapeMd(`⚠️ Low stock alerts: ${lowStock} product(s)`))
  lines.push("")
  lines.push(escapeMd("Use /today or /tomorrow for details."))
  await tgSendMessage(chatId, lines.join("\n"))
}

async function handleCommand(command: string, args: string[], chatId: string) {
  if (chatId !== ADMIN_CHAT_ID) {
    await tgSendMessage(chatId, escapeMd("⛔ Unauthorized. This bot is restricted to clinic administrators."))
    return
  }
  const cmd = command.toLowerCase().replace(/^\//, "")
  switch (cmd) {
    case "start": await sendHelp(chatId, "Welcome to Glow & Smooth Clinic Bot! 🌸"); return
    case "help": await sendHelp(chatId); return
    case "today": await sendTodaySummary(chatId); return
    case "tomorrow": await sendTomorrowSummary(chatId); return
    case "today_appointments":
    case "today_appts": {
      const lines = [`*${escapeMd("📅 TODAY'S APPOINTMENTS")}*`, escapeMd(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })), "", ...(await fetchAppointmentsText(0))]
      await tgSendMessage(chatId, lines.join("\n")); return
    }
    case "today_orders": {
      const lines = [`*${escapeMd("🛒 TODAY'S ORDERS")}*`, escapeMd(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })), "", ...(await fetchOrdersText(0))]
      await tgSendMessage(chatId, lines.join("\n")); return
    }
    case "tomorrow_appointments":
    case "tomorrow_appts": {
      const d = addDays(new Date(), 1)
      const lines = [`*${escapeMd("📆 TOMORROW'S APPOINTMENTS")}*`, escapeMd(d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })), "", ...(await fetchAppointmentsText(1))]
      await tgSendMessage(chatId, lines.join("\n")); return
    }
    case "tomorrow_orders": {
      const d = addDays(new Date(), 1)
      const lines = [`*${escapeMd("🛒 TOMORROW'S ORDERS")}*`, escapeMd(d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })), "", ...(await fetchOrdersText(1))]
      await tgSendMessage(chatId, lines.join("\n")); return
    }
    case "stats": await sendStats(chatId); return
    default:
      await tgSendMessage(chatId, escapeMd(`Unknown command: /${cmd}\n\nType /help to see available commands.`))
  }
}

// ============================================================================
// Long polling loop
// ============================================================================

let offset = 0
console.log("🔄 Telegram poller started. Listening for messages...")
console.log(`   Admin chat ID: ${ADMIN_CHAT_ID}`)
console.log("   Press Ctrl+C to stop.\n")

// Set bot commands for autocomplete
try {
  await fetch(`${API}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "today", description: "Today's appointments + orders" },
        { command: "tomorrow", description: "Tomorrow's appointments + orders (reminder)" },
        { command: "today_appointments", description: "Today's appointments only" },
        { command: "today_orders", description: "Today's orders only" },
        { command: "tomorrow_appointments", description: "Tomorrow's appointments only" },
        { command: "tomorrow_orders", description: "Tomorrow's orders only" },
        { command: "stats", description: "Quick revenue & count summary" },
        { command: "help", description: "Show available commands" },
      ],
      scope: { type: "chat", chat_id: parseInt(ADMIN_CHAT_ID) },
    }),
  })
  console.log("✅ Bot commands set (visible in Telegram autocomplete)")
} catch (e) {
  console.warn("⚠️ Could not set bot commands:", e)
}

async function poll() {
  while (true) {
    try {
      const res = await fetch(`${API}/getUpdates?offset=${offset}&timeout=30`, {
        method: "GET",
      })
      const data = await res.json()
      if (!data.ok) {
        console.error("❌ getUpdates failed:", data.description)
        await new Promise((r) => setTimeout(r, 5000))
        continue
      }
      const updates = data.result || []
      for (const update of updates) {
        offset = update.update_id + 1
        const msg = update.message
        if (!msg || !msg.text) continue
        const isCommand = msg.entities?.some((e: { type: string }) => e.type === "bot_command")
        if (!isCommand) continue
        const [cmdWithMention, ...args] = msg.text.trim().split(/\s+/)
        const cmd = cmdWithMention.replace(/^\/|@.*$/g, "")
        const chatId = String(msg.chat.id)
        console.log(`📩 /${cmd} from chat ${chatId}`)
        try {
          await handleCommand(cmd, args, chatId)
          console.log(`   ✓ Handled`)
        } catch (e) {
          console.error(`   ✗ Error:`, e)
        }
      }
    } catch (e) {
      console.error("Polling error:", e)
      await new Promise((r) => setTimeout(r, 5000))
    }
  }
}

poll()
