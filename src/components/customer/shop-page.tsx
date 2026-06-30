"use client"

import { useQuery } from "@tanstack/react-query"
import { useNav } from "@/store/nav"
import { useCart } from "@/store/cart"
import { apiGet } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ShoppingBag, Search, Plus, Leaf, Filter } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
  category?: { id: string; name: string } | null
}

interface Category {
  id: string
  name: string
  _count?: { products: number }
}

export function ShopPage() {
  const navigate = useNav((s) => s.navigate)
  const addItem = useCart((s) => s.addItem)
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<string>("All")
  const [sort, setSort] = useState<string>("featured")

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", "active"],
    queryFn: () => apiGet<{ products: Product[] }>("/api/products?active=true"),
  })
  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<{ categories: Category[] }>("/api/categories"),
  })

  let products = productsData?.products || []
  if (cat !== "All") products = products.filter((p) => p.category?.id === cat)
  if (q) products = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
  if (sort === "price-asc") products = [...products].sort((a, b) => a.price - b.price)
  if (sort === "price-desc") products = [...products].sort((a, b) => b.price - a.price)
  if (sort === "name") products = [...products].sort((a, b) => a.name.localeCompare(b.name))

  const handleAdd = (p: Product) => {
    addItem({
      productId: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      stock: p.stock,
    })
    toast.success(`Added ${p.name} to cart`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 bg-rose-100 text-rose-700">
          <ShoppingBag className="mr-1.5 h-3 w-3" />
          Shop
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Beauty Essentials</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Professional-grade skincare and aftercare products, handpicked by our specialists.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={cat === "All" ? "default" : "outline"}
            onClick={() => setCat("All")}
            className={cat === "All" ? "bg-rose-500 hover:bg-rose-600" : ""}
          >
            All
          </Button>
          {(catData?.categories || []).map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={cat === c.id ? "default" : "outline"}
              onClick={() => setCat(c.id)}
              className={cat === c.id ? "bg-rose-500 hover:bg-rose-600" : ""}
            >
              {c.name}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-32">
              <Filter className="mr-1 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price ↑</SelectItem>
              <SelectItem value="price-desc">Price ↓</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <div className="aspect-square shimmer" />
              <CardContent className="p-3">
                <div className="h-3 w-2/3 shimmer rounded" />
                <div className="mt-2 h-4 w-1/3 shimmer rounded" />
              </CardContent>
            </Card>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            No products found.
          </div>
        ) : (
          products.map((p) => (
            <Card
              key={p.id}
              className="group cursor-pointer overflow-hidden transition hover:shadow-lg"
              onClick={() => navigate({ name: "product_detail", productId: p.id })}
            >
              <div className="relative aspect-square overflow-hidden bg-rose-50">
                {p.imageUrl ? (
                   
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Leaf className="h-12 w-12 text-rose-300" />
                  </div>
                )}
                {p.stock <= 5 && p.stock > 0 && (
                  <Badge variant="secondary" className="absolute left-2 top-2 bg-amber-100 text-amber-800">
                    Only {p.stock} left
                  </Badge>
                )}
                {p.stock === 0 && (
                  <Badge variant="secondary" className="absolute left-2 top-2 bg-rose-100 text-rose-700">
                    Out of stock
                  </Badge>
                )}
              </div>
              <CardContent className="p-3">
                <div className="line-clamp-2 text-sm font-medium">{p.name}</div>
                {p.category && (
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {p.category.name}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-bold text-rose-600 truncate">{formatMoney(p.price)}</span>
                  <Button
                    size="icon"
                    className="h-10 w-10 shrink-0 bg-rose-500 hover:bg-rose-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAdd(p)
                    }}
                    disabled={p.stock === 0}
                    aria-label={`Add ${p.name} to cart`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
