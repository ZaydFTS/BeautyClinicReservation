"use client"

import { useNav, type Route } from "@/store/nav"
import { useLang } from "@/store/lang"
import { useCart } from "@/store/cart"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { useDiscount, calculateDiscountedPrice, getDiscount, type DiscountConfig } from "@/lib/discount"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Plus, Minus, ShoppingBag, Leaf, Clock, HelpCircle, Sparkles, ShieldCheck, Truck, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { Reveal } from "@/components/shared/reveal"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  cost: number
  stock: number
  lowStockAt: number
  imageUrl: string | null
  categoryId: string | null
  category: { id: string; name: string } | null
}

export function ProductDetailPage({ route }: { route: Extract<Route, { name: "product_detail" }> }) {
  const navigate = useNav((s) => s.navigate)
  const t = useLang((s) => s.t)
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["product", route.productId],
    queryFn: () => apiGet<{ product: Product }>(`/api/products/${route.productId}`),
  })
  const { data: discountData } = useDiscount()
  const discount: DiscountConfig = getDiscount(discountData?.discount)

  const product = data?.product

  const handleAdd = () => {
    if (!product) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    }, qty)
    toast.success(t("productDetail.addedToCart", { qty, name: product.name }))
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-[4/5] shimmer rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 shimmer rounded" />
            <div className="h-4 w-1/3 shimmer rounded" />
            <div className="h-32 w-full shimmer rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/15" aria-hidden />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-blush">
            <HelpCircle className="h-9 w-9 text-primary" />
          </div>
        </div>
        <h2 className="mt-6 font-serif text-2xl font-bold tracking-tight">{t("productDetail.notFound")}</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          {t("productDetail.notFoundDesc")}
        </p>
        <Button
          className="btn-press mt-6 bg-primary hover:bg-primary/90"
          onClick={() => navigate({ name: "shop" })}
        >
          <ChevronLeft className="me-2 h-4 w-4" />
          {t("productDetail.backToShop")}
        </Button>
      </div>
    )
  }

  const priceInfo = calculateDiscountedPrice(product.price, discount, "product", product.categoryId)

  return (
    <div className="flex flex-col">
      {/* Hero section with breadcrumb + product showcase */}
      <section className="bg-blush relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate({ name: "shop" })}
            className="press-feedback mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("productDetail.backToShop")}
          </button>

          <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
            {/* Left - Product Image */}
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-outline-variant bg-card shadow-xl shadow-primary/10">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />

                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="img-zoom relative h-full w-full object-cover"
                  />
                ) : (
                  <div className="relative flex h-full items-center justify-center bg-blush">
                    <Leaf className="h-24 w-24 text-primary/25" />
                  </div>
                )}

                {/* Discount badge */}
                {priceInfo.hasDiscount && (
                  <div className="absolute left-4 top-4">
                    <span className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/30">
                      -{priceInfo.percent}%
                    </span>
                  </div>
                )}

                {/* Low-stock badge */}
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary shadow-md backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {t("productDetail.onlyLeft", { n: product.stock })}
                    </span>
                  </div>
                )}

                {/* Out-of-stock overlay */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                    <span className="rounded-full border border-outline-variant bg-white/80 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-secondary shadow-sm backdrop-blur-md">
                      {t("productDetail.outOfStock")}
                    </span>
                  </div>
                )}
              </div>
            </Reveal>

            {/* Right - Product Details */}
            <Reveal delay={150}>
              <div className="flex flex-col">
                {/* Category */}
                {product.category && (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-px w-6 bg-primary" aria-hidden />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      {product.category.name}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="mt-5 flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary sm:text-4xl">
                    {formatMoney(priceInfo.discounted)}
                  </span>
                  {priceInfo.hasDiscount && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatMoney(priceInfo.original)}
                    </span>
                  )}
                  {priceInfo.hasDiscount && (
                    <span className="inline-flex items-center rounded-full bg-primary-container/30 px-2.5 py-1 text-xs font-bold text-primary">
                      Save {formatMoney(priceInfo.original - priceInfo.discounted)}
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                )}

                {/* Purchase panel */}
                <Card className="mt-8 rounded-2xl border-outline-variant/70 bg-blush shadow-none">
                  <CardContent className="p-5 sm:p-6">
                    {/* Quantity + Add to cart */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {/* Quantity selector */}
                      <div className="inline-flex h-12 shrink-0 items-center gap-1 rounded-full border border-outline-variant/70 bg-white/80 p-1 shadow-sm backdrop-blur-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="press-feedback h-10 w-10 rounded-full text-secondary hover:bg-blush hover:text-primary"
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          disabled={qty <= 1}
                          aria-label={t("productDetail.decreaseQty")}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center text-lg font-bold tabular-nums text-foreground">
                          {qty}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="press-feedback h-10 w-10 rounded-full text-secondary hover:bg-blush hover:text-primary"
                          onClick={() => setQty(Math.min(product.stock, qty + 1))}
                          disabled={qty >= product.stock}
                          aria-label={t("productDetail.increaseQty")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Add to cart button */}
                      <Button
                        size="lg"
                        className="btn-press btn-shimmer h-12 w-full gap-2 rounded-full bg-primary text-base font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 sm:w-auto sm:flex-1"
                        onClick={handleAdd}
                        disabled={product.stock === 0}
                      >
                        <ShoppingBag className="h-5 w-5" />
                        {t("productDetail.addToCart")} · {formatMoney(priceInfo.discounted * qty)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Trust badges */}
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-xl border border-outline-variant/60 bg-card p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blush">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t("productDetail.pickupDelivery")}</div>
                      <div className="text-xs text-muted-foreground">{t("productDetail.pickupDesc")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-outline-variant/60 bg-card p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blush">
                      <Leaf className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t("productDetail.crueltyFree")}</div>
                      <div className="text-xs text-muted-foreground">{t("productDetail.crueltyFreeDesc")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-outline-variant/60 bg-card p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blush">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">Quality Guaranteed</div>
                      <div className="text-xs text-muted-foreground">Premium ingredients</div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
