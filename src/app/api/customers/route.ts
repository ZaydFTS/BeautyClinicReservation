import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || undefined

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ]
  }

  const customers = await db.customer.findMany({
    where,
    include: {
      _count: {
        select: { appointments: true, orders: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ customers })
}
