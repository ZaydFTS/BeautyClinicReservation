"use client"

import { useNav, type Route } from "@/store/nav"
import { useCart } from "@/store/cart"
import { useQuery, useMutation } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Plus, Minus, ShoppingBag, Leaf, Clock } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  cost: number
  stock: number
  lowStockAt: number
  imageUrl: string | null
  category: { id: string; name: string } | null
}

export function ProductDetailPage({ route }: { route: Extract<Route, { name: "product_detail" }> }) {
  const navigate = useNav((s) => s.navigate)
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["product", route.productId],
    queryFn: () => apiGet<{ product: Product }>(`/api/products/${route.productId}`),
  })

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
    toast.success(`Added ${qty} × ${product.name} to cart`)
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square shimmer rounded-2xl" />
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
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button className="mt-4" onClick={() => navigate({ name: "shop" })}>
          Back to shop
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" onClick={() => navigate({ name: "shop" })} className="mb-4">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to shop
      </Button>

      <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
        {/* Image — premium panel */}
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-rose-100/70 bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50/60 shadow-sm ring-1 ring-rose-100/40">
          {/* Decorative orbs (visible around image edges) */}
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-rose-300/40 via-rose-200/30 to-amber-200/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-gradient-to-br from-amber-200/30 to-rose-200/20 blur-3xl"
            aria-hidden
          />
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="relative h-full w-full object-cover"
            />
          ) : (
            <div className="relative flex h-full items-center justify-center">
              <Leaf className="h-24 w-24 text-rose-300/70" />
            </div>
          )}
          {/* Subtle vignette overlay for premium depth */}
          <div
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.06)]"
            aria-hidden
          />

          {/* Low-stock badge — glassmorphic amber pill */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 shadow-md backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Only {product.stock} left
            </div>
          )}

          {/* Out-of-stock — elegant overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <span className="rounded-full border border-rose-200 bg-white/80 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-rose-700 shadow-sm backdrop-blur-md">
                Out of stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.category && (
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-rose-700/70">
              {product.category.name}
            </div>
          )}
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 text-4xl font-bold tracking-tight">
            <span className="text-gradient-rose">{formatMoney(product.price)}</span>
          </div>

          {product.description && (
            <p className="mt-5 leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {/* Purchase panel — premium glass card */}
          <Card className="mt-6 border-rose-100/70 bg-gradient-to-br from-rose-50/80 to-amber-50/40 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {/* Quantity selector */}
                <div className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full border border-rose-200/70 bg-white/80 p-1 shadow-sm backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-rose-700 hover:bg-rose-100 hover:text-rose-800"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-base font-semibold tabular-nums">
                    {qty}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-rose-700 hover:bg-rose-100 hover:text-rose-800"
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    disabled={qty >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Add to cart — full width, premium gradient */}
                <Button
                  size="lg"
                  className="btn-shimmer flex-1 gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 shadow-md shadow-rose-500/20 hover:from-rose-600 hover:to-rose-700 hover:shadow-lg hover:shadow-rose-500/30"
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to cart · {formatMoney(product.price * qty)}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pickup info */}
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-100/70">
                <Clock className="h-3.5 w-3.5 text-rose-600" />
              </div>
              <div className="pt-0.5">
                <strong>Pickup or delivery:</strong> Available within 2-3 business days.
                Pay in clinic or cash on delivery.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-100/70">
                <Leaf className="h-3.5 w-3.5 text-rose-600" />
              </div>
              <div className="pt-0.5">
                <strong>Cruelty-free:</strong> All our products are cruelty-free and
                dermatologically tested.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
