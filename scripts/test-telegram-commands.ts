// Test the command handlers directly (without going through Telegram)
// Useful to verify the formatting before testing via the actual bot.
//
// Usage: bun run scripts/test-telegram-commands.ts

import { handleCommand } from "../src/lib/telegram-bot"

const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID

if (!ADMIN_CHAT_ID) {
  console.error("❌ TELEGRAM_ADMIN_CHAT_ID must be set in .env")
  process.exit(1)
}

async function main() {
  const command = process.argv[2] || "today"
  console.log(`📤 Sending /${command} command to chat ${ADMIN_CHAT_ID}...`)
  const result = await handleCommand(command, [], ADMIN_CHAT_ID)
  if (result.ok) {
    console.log("✅ Command sent — check your Telegram chat!")
  } else {
    console.error("❌ Failed:", result.error)
  }
}

main().catch((e) => {
  console.error("❌ Error:", e)
  process.exit(1)
})
