// Unregister the Telegram webhook and switch to polling mode.
// Useful if you want to use the polling mini-service instead of a webhook.
//
// Usage: bun run scripts/unregister-telegram-webhook.ts

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN must be set in .env")
  process.exit(1)
}

async function main() {
  console.log("🧹 Deleting Telegram webhook...")
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drop_pending_updates: true }),
  })
  const data = await res.json()
  if (data.ok) {
    console.log("✅ Webhook deleted. Bot is now in polling mode.")
    console.log("   Run the poller: bun run mini-services/telegram-poller/index.ts")
  } else {
    console.error("❌ deleteWebhook failed:", data.description)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error("❌ Failed:", e)
  process.exit(1)
})
