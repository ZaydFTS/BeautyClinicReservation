import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifyNewOrder, notifyLowStock } from "@/lib/telegram"
import { ORDER_STATUS } from "@/lib/constants"

// GET /api/orders - admin: all orders
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || undefined
  const customerId = searchParams.get("customerId") || undefined

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (customerId) where.customerId = customerId

  const orders = await db.order.findMany({
    where,
    include: {
      items: { include: { product: true } },
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ orders })
}

// POST /api/orders - customer places an order (no online payment)
// Body: { customerName, phone, email, address, notes, paymentMethod, items: [{productId, quantity}] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customerName, phone, email, address, notes,
      paymentMethod = "CASH_IN_CLINIC", items = [],
    } = body

    if (!customerName || !phone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "customerName, phone, and items are required" },
        { status: 400 }
      )
    }

    const result = await db.$transaction(async (tx) => {
      // Validate products and snapshot prices
      const itemRows: {
        productId: string
        name: string
        price: number
        quantity: number
        total: number
      }[] = []

      let subtotal = 0

      for (const it of items) {
        const product = await tx.product.findUnique({ where: { id: it.productId } })
        if (!product) throw new Error(`Product not found: ${it.productId}`)
        if (!product.active) throw new Error(`Product not available: ${product.name}`)

        const qty = Number(it.quantity)
        if (!Number.isInteger(qty) || qty < 1) {
          throw new Error(`Invalid quantity for ${product.name}`)
        }
        if (product.stock < qty) {
          throw new Error(`Insufficient stock for ${product.name} (have ${product.stock}, need ${qty})`)
        }

        const total = product.price * qty
        subtotal += total
        itemRows.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          total,
        })
      }

      // Find or create customer
      let customer = await tx.customer.findFirst({ where: { phone } })
      if (!customer) {
        customer = await tx.customer.create({
          data: { name: customerName, phone, email: email || null },
        })
      }

      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          customerName,
          customerPhone: phone,
          customerEmail: email || null,
          address: address || null,
          notes: notes || null,
          status: ORDER_STATUS.PENDING,
          paymentMethod,
          subtotal,
          total: subtotal,
          items: {
            create: itemRows,
          },
        },
        include: { items: true },
      })

      // Decrement stock for each product (instant inventory update)
      for (const it of itemRows) {
        const updated = await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        })

        // Low stock alert (only if crossed threshold)
        if (
          updated.stock <= updated.lowStockAt &&
          updated.stock + it.quantity > updated.lowStockAt
        ) {
          // Fire and forget - we don't await inside tx for external calls
          notifyLowStock({
            productName: updated.name,
            currentStock: updated.stock,
            threshold: updated.lowStockAt,
          }).catch(() => {})
        }
      }

      await tx.transaction.create({
        data: {
          type: "ORDER",
          amount: subtotal,
          status: "PENDING",
          refId: order.id,
          refKind: "Order",
          description: `Order: ${itemRows.length} items`,
          customerId: customer.id,
        },
      })

      return order
    })

    notifyNewOrder({
      orderId: result.id,
      customerName,
      total: result.total,
      items: result.items.length,
      paymentMethod,
    }).catch(() => {})

    return NextResponse.json({ order: result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
