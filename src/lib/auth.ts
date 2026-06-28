// Admin authentication - simple session token based auth
// Uses cookie httpOnly session for security

import { db } from "@/lib/db"
import { cookies } from "next/headers"
import crypto from "crypto"
import { DEFAULT_ADMIN } from "@/lib/constants"

const SESSION_COOKIE = "bc_admin_session"
const SESSION_TTL_DAYS = 7

export function hashPassword(pw: string): string {
  // simple sha256 hash with salt - in production use bcrypt/argon2
  const salt = "beauty-clinic-salt-v1"
  return crypto.createHash("sha256").update(salt + pw).digest("hex")
}

export function verifyPassword(pw: string, hash: string): boolean {
  return hashPassword(pw) === hash
}

export async function createSession(adminId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  await db.adminSession.create({
    data: { token, adminId, expiresAt },
  })
  return token
}

export async function setSessionCookie(token: string) {
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    expires,
    path: "/",
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

export async function getCurrentAdmin() {
  const token = await getSessionToken()
  if (!token) return null
  const session = await db.adminSession.findUnique({
    where: { token },
    include: { admin: true },
  })
  if (!session) return null
  if (session.expiresAt < new Date()) {
    await db.adminSession.delete({ where: { id: session.id } })
    return null
  }
  return session.admin
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    throw new Error("UNAUTHORIZED")
  }
  return admin
}

// Ensure a default admin user exists (called on first run)
export async function ensureDefaultAdmin() {
  const existing = await db.adminUser.findUnique({
    where: { email: DEFAULT_ADMIN.email },
  })
  if (!existing) {
    await db.adminUser.create({
      data: {
        email: DEFAULT_ADMIN.email,
        passwordHash: hashPassword(DEFAULT_ADMIN.password),
        name: DEFAULT_ADMIN.name,
        role: "SUPER_ADMIN",
      },
    })
  }
}
