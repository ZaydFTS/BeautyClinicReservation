import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In production (Vercel), don't log queries for performance.
// In development, log queries for debugging.
const logConfig = process.env.NODE_ENV === 'production' ? ['error'] : ['error']

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logConfig,
  })

// Always cache the Prisma instance to prevent connection exhaustion on serverless
if (globalForPrisma.prisma === undefined) {
  globalForPrisma.prisma = db
}
