"use client"

import { useNav, type Route } from "@/store/nav"
import { useCart } from "@/store/cart"
import { useQuery, useMutation } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Plus, Minus, Trash2, ShoppingBag, Leaf, Clock } from "lucide-react"
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

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-rose-50">
          {product.imageUrl ? (
             
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Leaf className="h-24 w-24 text-rose-300" />
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="secondary" className="absolute left-4 top-4 bg-amber-100 text-amber-800">
              Only {product.stock} left in stock
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute left-4 top-4 bg-rose-100 text-rose-700">
              Out of stock
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.category && (
            <Badge variant="secondary" className="mb-2 w-fit bg-rose-100 text-rose-700">
              {product.category.name}
            </Badge>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <div className="mt-2 text-3xl font-bold text-rose-600">
            {formatMoney(product.price)}
          </div>

          {product.description && (
            <p className="mt-4 text-muted-foreground">{product.description}</p>
          )}

          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{qty}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    disabled={qty >= product.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 bg-rose-500 hover:bg-rose-600"
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to cart · {formatMoney(product.price * qty)}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
              <div>
                <strong>Pickup or delivery:</strong> Available within 2-3 business days.
                Pay in clinic or cash on delivery.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Leaf className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
              <div>
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
