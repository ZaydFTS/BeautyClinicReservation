// Quick Telegram bot test - sends a test message to the configured admin chat
// Run with: bun run /home/z/my-project/scripts/test-telegram.ts

import { sendAdminTelegramNotification } from "../src/lib/telegram"

async function main() {
  console.log("📤 Sending test Telegram notification...")
  console.log(`   Bot token: ${process.env.TELEGRAM_BOT_TOKEN ? "✓ set" : "✗ missing"}`)
  console.log(`   Chat ID:   ${process.env.TELEGRAM_ADMIN_CHAT_ID || "(missing)"}`)

  const result = await sendAdminTelegramNotification({
    subject: "🧪 Test Notification",
    message: [
      "Hello from Glow & Smooth Laser Clinic!",
      "",
      "This is a test message confirming your Telegram bot integration is working.",
      "You'll receive notifications here for:",
      "  • New appointments",
      "  • New orders",
      "  • Low stock alerts",
      "",
      `Sent at: ${new Date().toISOString()}`,
    ].join("\n"),
  })

  if (result.ok) {
    console.log("\n✅ SUCCESS! Check your Telegram chat for the test message.")
  } else {
    console.log("\n❌ FAILED:", result.error)
  }
}

main().catch((e) => {
  console.error("❌ Error:", e)
  process.exit(1)
})
