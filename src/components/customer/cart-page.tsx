"use client"

import { useNav } from "@/store/nav"
import { useLang } from "@/store/lang"
import { useCart } from "@/store/cart"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft, Sparkles, Leaf, HandHeart,
} from "lucide-react"
import { toast } from "sonner"
import { Reveal } from "@/components/shared/reveal"

export function CartPage() {
  const navigate = useNav((s) => s.navigate)
  const t = useLang((s) => s.t)
  const { items, removeItem, updateQty, totalPrice, totalItems } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden bg-blush">
          <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/15" aria-hidden />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white">
                <ShoppingBag className="h-9 w-9 text-primary" />
              </div>
            </div>
            <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-foreground">{t("cart.empty")}</h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              {t("cart.emptyDesc")}
            </p>
            <Button
              size="lg"
              className="btn-press btn-shimmer mt-8 rounded-full bg-primary px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90"
              onClick={() => navigate({ name: "shop" })}
            >
              <ShoppingBag className="me-2 h-5 w-5" />
              {t("cart.continueShopping")}
              <ArrowRight className="arrow-slide ms-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    )
  }

  const subtotal = totalPrice()
  const total = subtotal

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-blush">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate({ name: "shop" })}
            className="press-feedback mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("cart.continueShopping")}
          </button>

          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-8 bg-primary" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <ShoppingBag className="mr-1 inline h-3 w-3" />
              {t("cart.yourCart")}
            </span>
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t("cart.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {totalItems()} {t("cart.items")}
          </p>
        </div>
      </section>

      {/* Cart items + summary */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item, i) => (
              <Reveal key={item.productId} delay={i * 80}>
                <Card className="card-lift overflow-hidden rounded-2xl border-outline-variant/70 bg-card py-0 shadow-none transition-all duration-300 hover:border-primary">
                  <CardContent className="p-4 sm:p-5">
                    {/* Top row: image + info (always horizontal) */}
                    <div className="flex items-start gap-3 sm:gap-5">
                      {/* Product image */}
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-blush sm:h-24 sm:w-24">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="img-zoom h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Leaf className="h-8 w-8 text-primary/25" />
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-serif text-base font-bold tracking-tight text-foreground sm:text-lg">
                          {item.name}
                        </div>
                        <div className="mt-0.5 text-sm text-primary font-semibold">
                          {formatMoney(item.price)}
                        </div>
                        {item.stock <= 5 && (
                          <div className="mt-1 text-xs text-secondary">
                            Only {item.stock} left in stock
                          </div>
                        )}
                      </div>

                      {/* Remove button - top right (desktop only in this row) */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="press-feedback hidden h-9 w-9 flex-shrink-0 text-muted-foreground hover:bg-primary hover:text-white sm:flex"
                        onClick={() => {
                          removeItem(item.productId)
                          toast(t("cart.itemRemoved"))
                        }}
                        aria-label={t("cart.removeItem")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Bottom row: quantity + line total + remove (mobile) */}
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-outline-variant/60 pt-3 sm:mt-0 sm:justify-end sm:gap-4 sm:border-0 sm:pt-0">
                      {/* Quantity selector */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="press-feedback h-9 w-9 rounded-full border-outline-variant text-secondary hover:border-primary hover:bg-primary hover:text-white"
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
                            updateQty(item.productId, Math.min(n, item.stock))
                          }}
                          className="h-9 w-12 border-outline-variant bg-blush/50 text-center text-sm font-semibold focus:border-primary sm:w-14"
                          min={1}
                          max={item.stock}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="press-feedback h-9 w-9 rounded-full border-outline-variant text-secondary hover:border-primary hover:bg-primary hover:text-white"
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label={t("productDetail.increaseQty")}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Line total */}
                      <div className="flex-1 text-end text-sm font-bold text-foreground sm:flex-none sm:w-20 sm:text-base">
                        {formatMoney(item.price * item.quantity)}
                      </div>

                      {/* Remove button - mobile only */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="press-feedback h-9 w-9 flex-shrink-0 text-muted-foreground hover:bg-primary hover:text-white sm:hidden"
                        onClick={() => {
                          removeItem(item.productId)
                          toast(t("cart.itemRemoved"))
                        }}
                        aria-label={t("cart.removeItem")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card className="overflow-hidden rounded-2xl border-outline-variant/70 bg-blush shadow-none">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-px w-6 bg-primary" aria-hidden />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                      Summary
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                    {t("checkout.orderSummary")}
                  </h2>

                  {/* Price breakdown */}
                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                      <span className="font-medium text-foreground">{formatMoney(subtotal)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-4 flex items-end justify-between border-t border-outline-variant pt-4">
                    <span className="font-semibold text-foreground">{t("cart.total")}</span>
                    <span className="font-serif text-3xl font-bold text-primary">{formatMoney(total)}</span>
                  </div>

                  {/* Pay in clinic info - fixed contrast */}
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary p-3 text-white">
                    <HandHeart className="h-4 w-4 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold">{t("cart.payInClinic")}</div>
                      <div className="text-xs text-white/80">{t("cart.payInClinicDesc")}</div>
                    </div>
                  </div>

                  {/* Checkout button */}
                  <Button
                    size="lg"
                    className="btn-press mt-5 w-full rounded-full bg-primary text-base font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90"
                    onClick={() => navigate({ name: "checkout" })}
                  >
                    {t("cart.checkout")}
                    <ArrowRight className="arrow-slide ms-2 h-4 w-4" />
                  </Button>

                  {/* Continue shopping link */}
                  <button
                    onClick={() => navigate({ name: "shop" })}
                    className="press-feedback mt-4 w-full text-center text-xs font-semibold text-secondary hover:text-primary"
                  >
                    {t("cart.continueShopping")}
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
