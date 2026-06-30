// Telegram Bot webhook endpoint
// Telegram will POST updates to this URL whenever a message is received.
//
// Setup: run `bun run scripts/register-telegram-webhook.ts <public_url>`
// to register this webhook with Telegram.
//
// Security: Telegram sends X-Telegram-Bot-Api-Secret-Token header on every
// webhook call. We verify it matches our derived secret (sha256 of bot token).

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { handleCommand } from "@/lib/telegram-bot"
import { db } from "@/lib/db"

// Derive a deterministic webhook secret from the bot token
function getWebhookSecret(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN || ""
  if (!token) return ""
  return crypto.createHash("sha256").update(token).digest("hex").slice(0, 32)
}

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    chat: { id: number | string; type: string }
    from?: { id: number; first_name: string; is_bot: boolean }
    text?: string
    entities?: { type: string; offset: number; length: number }[]
    date: number
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify secret token header
    const expectedSecret = getWebhookSecret()
    if (!expectedSecret) {
      return NextResponse.json({ error: "Bot not configured" }, { status: 500 })
    }
    const receivedSecret = req.headers.get("x-telegram-bot-api-secret-token")
    if (receivedSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const update: TelegramUpdate = await req.json()
    const msg = update.message

    // Only handle text messages with bot_command entities
    if (!msg || !msg.text) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const isCommand = msg.entities?.some((e) => e.type === "bot_command")
    if (!isCommand) {
      // Not a command — ignore silently
      return NextResponse.json({ ok: true, skipped: true })
    }

    // Parse: "/cmd args" or "/cmd@botname args"
    const text = msg.text.trim()
    const [cmdWithMention, ...args] = text.split(/\s+/)
    const cmd = cmdWithMention.replace(/^\/|@.*$/g, "")
    const chatId = String(msg.chat.id)

    // Log the command attempt
    await db.notificationLog.create({
      data: {
        channel: "TELEGRAM",
        to: chatId,
        subject: `Command: /${cmd}`,
        message: text,
        status: "SENT",
      },
    })

    // Handle the command (async — don't block the response)
    handleCommand(cmd, args, chatId).catch(async (e) => {
      const err = e instanceof Error ? e.message : String(e)
      await db.notificationLog.updateMany({
        where: { subject: `Command: /${cmd}` },
        data: { status: "FAILED", error: err.slice(0, 500) },
      })
    })

    // Respond to Telegram immediately (they have a 5s timeout)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET endpoint to verify webhook is alive
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "telegram-webhook",
    configured: !!process.env.TELEGRAM_BOT_TOKEN,
    timestamp: new Date().toISOString(),
  })
}
