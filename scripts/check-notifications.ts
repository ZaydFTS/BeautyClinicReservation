// Check recent NotificationLog entries
import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
const logs = await db.notificationLog.findMany({
  orderBy: { createdAt: "desc" },
  take: 5,
  select: { channel: true, subject: true, status: true, error: true, createdAt: true },
})
for (const l of logs) {
  console.log(`[${l.status}] ${l.channel} - ${l.subject}`)
  if (l.error) console.log(`  error: ${l.error.slice(0, 200)}`)
  console.log(`  at: ${l.createdAt.toISOString()}`)
}
await db.$disconnect()
