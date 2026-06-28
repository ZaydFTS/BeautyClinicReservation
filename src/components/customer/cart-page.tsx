"use client"

import { useNav } from "@/store/nav"
import { useCart } from "@/store/cart"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft,
} from "lucide-react"
import { toast } from "sonner"

export function CartPage() {
  const navigate = useNav((s) => s.navigate)
  const { items, removeItem, updateQty, totalPrice, totalItems } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
          <ShoppingBag className="h-10 w-10 text-rose-500" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">
          Browse our shop for premium aftercare products.
        </p>
        <Button
          className="mt-6 bg-rose-500 hover:bg-rose-600"
          onClick={() => navigate({ name: "shop" })}
        >
          Continue shopping
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    )
  }

  const subtotal = totalPrice()
  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" onClick={() => navigate({ name: "shop" })} className="mb-4">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Continue shopping
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">{totalItems()} item(s)</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-rose-50">
                  {item.imageUrl ? (
                     
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-rose-300">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{item.name}</div>
                  <div className="mt-0.5 text-sm text-rose-600">{formatMoney(item.price)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const n = parseInt(e.target.value) || 1
                      updateQty(item.productId, n)
                    }}
                    className="h-8 w-14 text-center"
                    min={1}
                    max={item.stock}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="hidden sm:block w-20 text-right font-semibold">
                  {formatMoney(item.price * item.quantity)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                  onClick={() => {
                    removeItem(item.productId)
                    toast("Item removed from cart")
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span className="font-medium">{formatMoney(tax)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-rose-600">{formatMoney(total)}</span>
              </div>
              <div className="rounded-md bg-rose-50 p-3 text-xs text-rose-700">
                <strong>Pay in clinic</strong> or cash on delivery.
                <br />
                No online payment required.
              </div>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                onClick={() => navigate({ name: "checkout" })}
              >
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
