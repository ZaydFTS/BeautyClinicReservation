import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionToken } from "@/lib/auth"

export async function POST() {
  try {
    const token = await getSessionToken()
    if (token) {
      await db.adminSession.deleteMany({ where: { token } })
    }
    const res = NextResponse.json({ ok: true })
    res.cookies.set("bc_admin_session", "", { expires: new Date(0), path: "/" })
    return res
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
