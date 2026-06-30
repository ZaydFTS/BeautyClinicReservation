// Register the Telegram webhook with Telegram's servers.
// Usage:
//   bun run scripts/register-telegram-webhook.ts <public_base_url>
//
// Example:
//   bun run scripts/register-telegram-webhook.ts https://preview-abc123.space-z.ai
//
// The script derives a secret token from the bot token (sha256 first 32 chars)
// and configures Telegram to include it in the X-Telegram-Bot-Api-Secret-Token
// header of every webhook call.

import crypto from "crypto"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID

if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
  console.error("❌ TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID must be set in .env")
  process.exit(1)
}

const publicBaseUrl = process.argv[2]
if (!publicBaseUrl) {
  console.error("❌ Usage: bun run scripts/register-telegram-webhook.ts <public_base_url>")
  console.error("   Example: bun run scripts/register-telegram-webhook.ts https://your-app.example.com")
  process.exit(1)
}

const webhookUrl = `${publicBaseUrl.replace(/\/$/, "")}/api/telegram/webhook`
const secretToken = crypto.createHash("sha256").update(BOT_TOKEN).digest("hex").slice(0, 32)

async function main() {
  console.log("📡 Registering Telegram webhook...")
  console.log(`   Webhook URL:  ${webhookUrl}`)
  console.log(`   Secret token: ${secretToken.slice(0, 8)}...${secretToken.slice(-4)}`)
  console.log("")

  // 1. Set the webhook
  const setRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secretToken,
      allowed_updates: JSON.stringify(["message"]),
      drop_pending_updates: true,
    }),
  })
  const setData = await setRes.json()
  if (!setData.ok) {
    console.error("❌ setWebhook failed:", setData.description)
    process.exit(1)
  }
  console.log("✅ Webhook registered:", setData.description)

  // 2. Set bot commands (so they show up in Telegram's command autocomplete)
  const commandsRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
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
  const commandsData = await commandsRes.json()
  if (commandsData.ok) {
    console.log("✅ Bot commands set (visible in Telegram autocomplete)")
  } else {
    console.warn("⚠️ setMyCommands failed:", commandsData.description)
  }

  // 3. Get webhook info to confirm
  const infoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
  const info = await infoRes.json()
  console.log("\n📋 Webhook info:")
  console.log(`   URL:            ${info.result.url}`)
  console.log(`   Pending updates: ${info.result.pending_update_count}`)
  console.log(`   Max connections: ${info.result.max_connections}`)
  if (info.result.last_error_date) {
    console.log(`   ⚠️ Last error:   ${info.result.last_error_message}`)
  }

  // 4. Send a welcome message
  const welcomeRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: ADMIN_CHAT_ID,
      text: [
        "🌸 *Glow & Smooth Clinic Bot is live!*",
        "",
        "Webhook registered successfully. You can now use these commands:",
        "",
        "📅 /today — Today's appointments + orders",
        "📆 /tomorrow — Tomorrow's reminder",
        "📊 /stats — Quick stats",
        "❓ /help — Full command list",
      ].join("\n"),
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }),
  })
  const welcomeData = await welcomeRes.json()
  if (welcomeData.ok) {
    console.log("\n✅ Welcome message sent to your Telegram chat — check it out!")
  } else {
    console.warn("\n⚠️ Could not send welcome message:", welcomeData.description)
  }

  console.log("\n🎯 Try sending /today to your bot now!")
}

main().catch((e) => {
  console.error("❌ Failed:", e)
  process.exit(1)
})
