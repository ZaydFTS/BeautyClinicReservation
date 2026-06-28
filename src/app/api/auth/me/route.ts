import { NextResponse } from "next/server"
import { getCurrentAdmin, ensureDefaultAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await ensureDefaultAdmin()
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ admin: null }, { status: 200 })
    }
    return NextResponse.json({
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    })
  } catch (e) {
    return NextResponse.json({ admin: null }, { status: 200 })
  }
}
