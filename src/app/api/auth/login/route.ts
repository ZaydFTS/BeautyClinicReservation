import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword, createSession, ensureDefaultAdmin } from "@/lib/auth"

const SESSION_COOKIE = "bc_admin_session"
const SESSION_TTL_DAYS = 7

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    await ensureDefaultAdmin()

    const admin = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } })
    if (!admin || admin.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await createSession(admin.id)
    const expires = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)

    const res = NextResponse.json({
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    })
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      expires,
      path: "/",
    })
    return res
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
