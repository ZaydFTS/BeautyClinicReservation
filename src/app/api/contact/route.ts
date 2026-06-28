// Contact form submission - sends telegram notification to admin only
import { NextRequest, NextResponse } from "next/server"
import { sendAdminTelegramNotification } from "@/lib/telegram"

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json()
    if (!name || !message) {
      return NextResponse.json({ error: "Name and message required" }, { status: 400 })
    }
    await sendAdminTelegramNotification({
      subject: "✉️ New Contact Form Message",
      message: [
        `From: ${name}`,
        email ? `Email: ${email}` : "",
        phone ? `Phone: ${phone}` : "",
        ``,
        `Message:`,
        message,
      ].filter(Boolean).join("\n"),
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
