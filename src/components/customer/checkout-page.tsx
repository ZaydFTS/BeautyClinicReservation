"use client"

import { useNav } from"@/store/nav"
import { useLang } from"@/store/lang"
import { useCart } from"@/store/cart"
import { apiPost } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { useDiscount, calculateDiscountedPrice, getDiscount, type DiscountConfig } from "@/lib/discount"
import { Button } from"@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import { Textarea } from"@/components/ui/textarea"
import {
 Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from"@/components/ui/select"
import { Badge } from"@/components/ui/badge"
import {
 User, Phone, Mail, MapPin, CreditCard, Loader2, Check, ShieldCheck,
 ShoppingBag, ChevronLeft, ArrowRight,
} from"lucide-react"
import { useState } from"react"
import { useMutation } from"@tanstack/react-query"
import { toast } from"sonner"

export function CheckoutPage() {
 const navigate = useNav((s) => s.navigate)
 const t = useLang((s) => s.t)
 const { items, totalPrice, clear } = useCart()

 const [form, setForm] = useState({
 customerName:"",
 phone:"",
 email:"",
 address:"",
 notes:"",
 paymentMethod:"CASH_IN_CLINIC",
 })

 const { data: discountData } = useDiscount()
 const discount: DiscountConfig = getDiscount(discountData?.discount)

 const itemsWithDiscount = items.map((item) => {
   const priceInfo = calculateDiscountedPrice(item.price, discount, "product", item.categoryId || null)
   return { ...item, discountedPrice: priceInfo.discounted, hasDiscount: priceInfo.hasDiscount }
 })
 const subtotal = itemsWithDiscount.reduce((sum, i) => sum + i.discountedPrice * i.quantity, 0)
 const originalSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
 const totalDiscount = originalSubtotal - subtotal
 const total = subtotal

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
 toast.success(t("checkout.orderPlacedToast"))
 navigate({ name:"order_success", orderId: data.order.id })
 },
 onError: (err: Error) => {
 toast.error(err.message || t("checkout.failedToast"))
 },
 })

 if (items.length === 0) {
 return (
 <div className="mx-auto max-w-4xl px-4 py-16 text-center">
 <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
 <div className="absolute inset-0 rounded-full bg-primary/15" aria-hidden />
 <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-blush">
 <ShoppingBag className="h-9 w-9 text-primary" />
 </div>
 </div>
 <h2 className="mt-6 text-2xl font-bold tracking-tight">{t("checkout.cartEmpty")}</h2>
 <p className="mx-auto mt-2 max-w-md text-muted-foreground">
 {t("checkout.cartEmptyDesc")}
 </p>
 <Button
 className="btn-shimmer mt-6 bg-primary"
 onClick={() => navigate({ name:"shop" })}
 >
 {t("cart.continueShopping")}
 <ArrowRight className="ms-2 h-4 w-4" />
 </Button>
 </div>
 )
 }

 return (
 <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
 <Button variant="ghost" size="sm" onClick={() => navigate({ name:"cart" })} className="mb-4">
 <ChevronLeft className="me-1 h-4 w-4" />
 {t("checkout.backToCart")}
 </Button>

 <h1 className="text-3xl font-bold tracking-tight">{t("checkout.title")}</h1>

 <div className="mt-6 grid gap-6 lg:grid-cols-3">
 {/* Left: form */}
 <div className="lg:col-span-2 space-y-6">
 {/* Customer info */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-lg">
 <User className="h-5 w-5 text-primary" />
 {t("checkout.yourInfo")}
 </CardTitle>
 </CardHeader>
 <CardContent className="grid gap-4 sm:grid-cols-2">
 <div className="space-y-2 sm:col-span-2">
 <Label htmlFor="name">{t("checkout.fullName")} <span className="text-primary">{t("checkout.required")}</span></Label>
 <Input
 id="name"
 value={form.customerName}
 onChange={(e) => setForm({ ...form, customerName: e.target.value })}
 placeholder="Jane Doe"
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="phone" className="flex items-center gap-1.5">
 <Phone className="h-3.5 w-3.5" /> {t("checkout.phone")} <span className="text-primary">{t("checkout.required")}</span>
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
 <Mail className="h-3.5 w-3.5" /> {t("checkout.email")}
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
 <MapPin className="h-3.5 w-3.5" /> {t("checkout.deliveryAddress")}
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
 <Label htmlFor="notes">{t("checkout.orderNotes")}</Label>
 <Textarea
 id="notes"
 rows={2}
 value={form.notes}
 onChange={(e) => setForm({ ...form, notes: e.target.value })}
 placeholder={t("checkout.orderNotesPlaceholder")}
 />
 </div>
 </CardContent>
 </Card>

 {/* Payment */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-lg">
 <CreditCard className="h-5 w-5 text-primary" />
 {t("checkout.paymentMethod")}
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
 <SelectItem value="CASH_IN_CLINIC">{t("checkout.payInClinic")}</SelectItem>
 <SelectItem value="COD">{t("checkout.cod")}</SelectItem>
 </SelectContent>
 </Select>
 <div className="mt-3 rounded-md bg-blush p-3 text-xs text-secondary">
 <ShieldCheck className="mb-1 h-4 w-4" />
 <strong>{t("checkout.noOnlinePayment")}</strong> {t("checkout.noOnlinePaymentDesc")}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Right: summary */}
 <div>
 <Card className="sticky top-20 border-outline-variant/70 shadow-sm">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-lg">
 <ShieldCheck className="h-4 w-4 text-primary" />
 {t("checkout.orderSummary")}
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="max-h-64 space-y-2 overflow-y-auto pe-1">
 {items.map((item) => (
 <div key={item.productId} className="flex items-center gap-2 text-sm">
 <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-blush">
 {item.imageUrl ? (
 
 <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
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
 <div className="space-y-2 border-t border-outline-variant pt-3 text-sm">
 {totalDiscount > 0 && (
 <div className="flex justify-between">
 <span className="text-muted-foreground">Original Price</span>
 <span className="text-muted-foreground line-through">{formatMoney(originalSubtotal)}</span>
 </div>
 )}
 <div className="flex justify-between">
 <span className="text-muted-foreground">{t("cart.subtotal")}</span>
 <span className="font-medium">{formatMoney(subtotal)}</span>
 </div>
 {totalDiscount > 0 && (
 <div className="flex justify-between">
 <span className="text-primary font-medium">Discount ({discount.percent}% off)</span>
 <span className="font-medium text-primary">-{formatMoney(totalDiscount)}</span>
 </div>
 )}
 <div className="flex items-end justify-between border-t border-outline-variant pt-2">
 <span className="font-semibold">{t("cart.total")}</span>
 <span className="text-primary text-2xl font-bold tracking-tight">{formatMoney(total)}</span>
 </div>
 </div>
 <Button
 size="lg"
 className="btn-shimmer w-full bg-primary"
 onClick={() => mutation.mutate()}
 disabled={mutation.isPending || !form.customerName || !form.phone}
 >
 {mutation.isPending ? (
 <>
 <Loader2 className="me-2 h-4 w-4 animate-spin" />
 {t("checkout.placingOrder")}
 </>
 ) : (
 <>
 <Check className="me-2 h-4 w-4" />
 {t("checkout.placeOrder")}
 </>
 )}
 </Button>
 <Badge variant="secondary" className="w-full justify-center py-2 text-center text-xs">
 <ShieldCheck className="me-1 h-3 w-3" />
 {t("checkout.secureCheckout")}
 </Badge>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 )
}
