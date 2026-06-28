"use client"

import { useNav } from "@/store/nav"
import { useCart } from "@/store/cart"
import { apiPost } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  User, Phone, Mail, MapPin, CreditCard, Loader2, Check, ShieldCheck,
  ShoppingBag, ChevronLeft,
} from "lucide-react"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export function CheckoutPage() {
  const navigate = useNav((s) => s.navigate)
  const { items, totalPrice, clear } = useCart()

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    paymentMethod: "CASH_IN_CLINIC",
  })

  const subtotal = totalPrice()
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<{ order: { id: string } }>("/api/orders", {
        customerName: form.customerName,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address || undefined,
        notes: form.notes || undefined,
        paymentMethod: form.paymentMethod,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    onSuccess: (data) => {
      clear()
      toast.success("Order placed! We'll be in touch shortly.")
      navigate({ name: "order_success", orderId: data.order.id })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to place order")
    },
  })

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
        <Button className="mt-4" onClick={() => navigate({ name: "shop" })}>
          Continue shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" onClick={() => navigate({ name: "cart" })} className="mb-4">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to cart
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left: form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-rose-500" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Full name *</Label>
                <Input
                  id="name"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone *
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Delivery address (if COD)
                </Label>
                <Textarea
                  id="address"
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Main St, Apt 4B, Beverly Hills, CA 90210"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Order notes (optional)</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special instructions..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-rose-500" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={form.paymentMethod}
                onValueChange={(v) => setForm({ ...form, paymentMethod: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH_IN_CLINIC">Pay in clinic (cash / card on arrival)</SelectItem>
                  <SelectItem value="COD">Cash on delivery</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-3 rounded-md bg-rose-50 p-3 text-xs text-rose-700">
                <ShieldCheck className="mb-1 h-4 w-4" />
                <strong>No online payment.</strong> Pay when you receive your products.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 text-sm">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-rose-50">
                      {item.imageUrl ? (
                         
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.quantity} × {formatMoney(item.price)}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {formatMoney(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="font-medium">{formatMoney(tax)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-rose-600">{formatMoney(total)}</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !form.customerName || !form.phone}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing order...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>
              <Badge variant="secondary" className="w-full justify-center py-2 text-center text-xs">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Secure checkout · No credit card needed
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
