// Telegram Bot API integration - admin notifications only
// Uses Bot API: https://core.telegram.org/bots/api#sendmessage
// Env vars required:
//   TELEGRAM_BOT_TOKEN - the bot token from BotFather
//   TELEGRAM_ADMIN_CHAT_ID - the admin's chat id to receive notifications
//
// If env vars are missing, the function logs and persists a NotificationLog
// entry with status "FAILED" so it can be retried later.

import { db } from "@/lib/db"

function getTelegramConfig() {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || "",
  }
}

export type NotificationPayload = {
  subject: string
  message: string
  // optional metadata
  meta?: Record<string, unknown>
}

export async function sendAdminTelegramNotification(
  payload: NotificationPayload
): Promise<{ ok: boolean; error?: string }> {
  const { botToken, adminChatId } = getTelegramConfig()

  const text = [
    `*${escapeMarkdown(payload.subject)}*`,
    ``,
    escapeMarkdown(payload.message),
  ].join("\n")

  // Always log the notification attempt
  const logEntry = await db.notificationLog.create({
    data: {
      channel: "TELEGRAM",
      to: adminChatId || "(unset)",
      subject: payload.subject,
      message: payload.message,
      status: "SENT",
    },
  })

  if (!botToken || !adminChatId) {
    await db.notificationLog.update({
      where: { id: logEntry.id },
      data: {
        status: "FAILED",
        error: "TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID not configured",
      },
    })
    // Silent fail in dev - we still log it
    console.warn(
      `[Telegram] Not configured. Logged notification "${payload.subject}" to DB.`
    )
    return { ok: false, error: "not-configured" }
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      await db.notificationLog.update({
        where: { id: logEntry.id },
        data: { status: "FAILED", error: errText.slice(0, 500) },
      })
      return { ok: false, error: errText }
    }
    return { ok: true }
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e)
    await db.notificationLog.update({
      where: { id: logEntry.id },
      data: { status: "FAILED", error: err.slice(0, 500) },
    })
    return { ok: false, error: err }
  }
}

function escapeMarkdown(s: string): string {
  // Telegram MarkdownV2 escape
  return s.replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, "\\$1")
}

// Convenience helpers
export function notifyNewAppointment(opts: {
  customerName: string
  serviceName: string
  when: string
  phone: string
}) {
  return sendAdminTelegramNotification({
    subject: "📅 New Appointment",
    message: [
      `Customer: ${opts.customerName}`,
      `Service: ${opts.serviceName}`,
      `When: ${opts.when}`,
      `Phone: ${opts.phone}`,
    ].join("\n"),
  })
}

export function notifyNewOrder(opts: {
  orderId: string
  customerName: string
  total: number
  items: number
  paymentMethod: string
}) {
  return sendAdminTelegramNotification({
    subject: "🛒 New Order",
    message: [
      `Order #: ${opts.orderId.slice(-8).toUpperCase()}`,
      `Customer: ${opts.customerName}`,
      `Items: ${opts.items}`,
      `Total: $${opts.total.toFixed(2)}`,
      `Payment: ${opts.paymentMethod}`,
    ].join("\n"),
  })
}

export function notifyLowStock(opts: {
  productName: string
  currentStock: number
  threshold: number
}) {
  return sendAdminTelegramNotification({
    subject: "⚠️ Low Stock Alert",
    message: [
      `Product: ${opts.productName}`,
      `Current stock: ${opts.currentStock}`,
      `Threshold: ${opts.threshold}`,
      `Restock soon.`,
    ].join("\n"),
  })
}
