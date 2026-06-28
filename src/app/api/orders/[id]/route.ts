import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, customer: true },
  })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ order })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Cancel the order and restock items
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!order) throw new Error("Order not found")
    if (order.status === "CANCELLED") return

    if (order.status === "PENDING") {
      // Restock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
    }
    await tx.order.update({ where: { id }, data: { status: "CANCELLED" } })
    await tx.transaction.updateMany({
      where: { refId: id, type: "ORDER" },
      data: { status: "CANCELLED" },
    })
  })

  return NextResponse.json({ ok: true })
}
