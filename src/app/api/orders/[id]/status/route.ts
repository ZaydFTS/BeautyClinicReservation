import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth"
import { ORDER_STATUS } from "@/lib/constants"

type Ctx = { params: Promise<{ id: string }> }

// PATCH /api/orders/[id]/status
// Body: { status: "PENDING" | "COMPLETED" | "CANCELLED" }
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { status } = await req.json()
  if (!["PENDING", "COMPLETED", "CANCELLED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const result = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!order) throw new Error("Order not found")

    // If already in target status, no-op
    if (order.status === status) return order

    // Restock on cancel (only if was PENDING and stock was already decremented)
    if (status === "CANCELLED" && order.status === "PENDING") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
    }
    // Reverse restock if cancelling a COMPLETED order (rare, but for safety, do nothing here)
    if (status === "CANCELLED" && order.status === ORDER_STATUS.COMPLETED) {
      // Already consumed - we don't restock; treat as write-off
    }

    const updated = await tx.order.update({
      where: { id },
      data: { status },
      include: { items: true, customer: true },
    })

    const txStatus = status === "COMPLETED" ? "COMPLETED" : status === "CANCELLED" ? "CANCELLED" : "PENDING"
    await tx.transaction.updateMany({
      where: { refId: id, type: "ORDER" },
      data: { status: txStatus },
    })

    return updated
  })

  return NextResponse.json({ order: result })
}
