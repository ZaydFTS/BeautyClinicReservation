"use client"

import { useNav } from"@/store/nav"
import { useLang } from"@/store/lang"
import { useCart } from"@/store/cart"
import { formatMoney } from"@/lib/format"
import { Button } from"@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { Input } from"@/components/ui/input"
import { Badge } from"@/components/ui/badge"
import {
 ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft, Sparkles,
} from"lucide-react"
import { toast } from"sonner"

export function CartPage() {
 const navigate = useNav((s) => s.navigate)
 const t = useLang((s) => s.t)
 const { items, removeItem, updateQty, totalPrice, totalItems } = useCart()

 if (items.length === 0) {
 return (
 <div className="mx-auto max-w-4xl px-4 py-16 text-center">
 <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
 <div className="absolute inset-0 rounded-full bg-primary/15" aria-hidden />
 <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-blush">
 <ShoppingBag className="h-9 w-9 text-primary" />
 </div>
 </div>
 <h2 className="mt-6 text-2xl font-bold tracking-tight">{t("cart.empty")}</h2>
 <p className="mx-auto mt-2 max-w-md text-muted-foreground">
 {t("cart.emptyDesc")}
 </p>
 <Button
 size="lg"
 className="btn-shimmer mt-6 w-full bg-primary"
 onClick={() => navigate({ name:"shop" })}
 >
 <ShoppingBag className="me-2 h-4 w-4" />
 {t("cart.continueShopping")}
 <ArrowRight className="ms-2 h-4 w-4" />
 </Button>
 </div>
 )
 }

 const subtotal = totalPrice()
 const tax = subtotal * 0.08
 const total = subtotal + tax

 return (
 <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
 <Button variant="ghost" size="sm" onClick={() => navigate({ name:"shop" })} className="mb-4">
 <ChevronLeft className="me-1 h-4 w-4" />
 {t("cart.continueShopping")}
 </Button>

 <div className="flex items-end justify-between gap-3">
 <div>
 <Badge variant="secondary" className="mb-2 bg-blush text-secondary">
 <Sparkles className="me-1.5 h-3 w-3" />
 {t("cart.yourCart")}
 </Badge>
 <h1 className="text-3xl font-bold tracking-tight">{t("cart.title")}</h1>
 <p className="mt-1 text-sm text-muted-foreground">{totalItems()} {t("cart.items")}</p>
 </div>
 </div>

 <div className="mt-6 grid gap-6 lg:grid-cols-3">
 {/* Items */}
 <div className="lg:col-span-2 space-y-3">
 {items.map((item) => (
 <Card key={item.productId} className="card-hover overflow-hidden rounded-xl border-outline-variant/70 shadow-sm transition-all duration-200 hover:border-outline-variant hover:shadow-md hover:shadow-primary/5">
 <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
 <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-blush">
 {item.imageUrl ? (
 
 <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
 ) : (
 <div className="flex h-full items-center justify-center text-primary-container">
 <ShoppingBag className="h-6 w-6" />
 </div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="truncate font-medium text-sm sm:text-base">{item.name}</div>
 <div className="mt-0.5 text-sm text-primary">{formatMoney(item.price)}</div>
 </div>
 <div className="flex items-center gap-1">
 <Button
 variant="outline"
 size="icon"
 className="h-9 w-9"
 onClick={() => updateQty(item.productId, item.quantity - 1)}
 disabled={item.quantity <= 1}
 aria-label={t("productDetail.decreaseQty")}
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
 className="h-9 w-12 sm:w-14 text-center"
 min={1}
 max={item.stock}
 />
 <Button
 variant="outline"
 size="icon"
 className="h-9 w-9"
 onClick={() => updateQty(item.productId, item.quantity + 1)}
 disabled={item.quantity >= item.stock}
 aria-label={t("productDetail.increaseQty")}
 >
 <Plus className="h-3 w-3" />
 </Button>
 </div>
 <div className="w-16 text-end text-sm font-semibold sm:w-20">
 {formatMoney(item.price * item.quantity)}
 </div>
 <Button
 variant="ghost"
 size="icon"
 className="h-9 w-9 text-muted-foreground hover:text-primary"
 onClick={() => {
 removeItem(item.productId)
 toast(t("cart.itemRemoved"))
 }}
 aria-label={t("cart.removeItem")}
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Summary */}
 <div>
 <Card className="sticky top-20 border-outline-variant/70 shadow-sm">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-lg">
 <Sparkles className="h-4 w-4 text-primary" />
 {t("checkout.orderSummary")}
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-sm">
 <div className="flex justify-between">
 <span className="text-muted-foreground">{t("cart.subtotal")}</span>
 <span className="font-medium">{formatMoney(subtotal)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">{t("cart.tax")}</span>
 <span className="font-medium">{formatMoney(tax)}</span>
 </div>
 <div className="flex items-end justify-between border-t border-outline-variant pt-3">
 <span className="font-semibold">{t("cart.total")}</span>
 <span className="text-primary text-2xl font-bold tracking-tight">{formatMoney(total)}</span>
 </div>
 <div className="rounded-lg bg-primary">
 <strong>{t("cart.payInClinic")}</strong> {t("cart.payInClinicDesc")}
 </div>
 <Button
 size="lg"
 className="btn-shimmer w-full bg-primary"
 onClick={() => navigate({ name:"checkout" })}
 >
 {t("cart.checkout")}
 <ArrowRight className="ms-2 h-4 w-4" />
 </Button>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 )
}
