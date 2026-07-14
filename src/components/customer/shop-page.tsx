"use client"

import { useQuery } from "@tanstack/react-query"
import { useNav } from "@/store/nav"
import { useLang } from "@/store/lang"
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
import { ShoppingBag, Search, Plus, Leaf, Filter, PackageSearch } from "lucide-react"
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
  const t = useLang((s) => s.t)
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
    toast.success(t("shop.addedToCart", { name: p.name }))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 bg-rose-100 text-rose-700">
          <ShoppingBag className="me-1.5 h-3 w-3" />
          {t("shop.badge")}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">{t("shop.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {t("shop.subtitle")}
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
            {t("servicesPage.allCategories")}
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
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("shop.searchPlaceholder")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-32">
              <Filter className="me-1 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">{t("shop.sortFeatured")}</SelectItem>
              <SelectItem value="price-asc">{t("shop.sortPriceAsc")}</SelectItem>
              <SelectItem value="price-desc">{t("shop.sortPriceDesc")}</SelectItem>
              <SelectItem value="name">{t("shop.sortName")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="stagger-children mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-2xl border-rose-100/70">
              <div className="aspect-square shimmer" />
              <CardContent className="space-y-2 p-4">
                <div className="h-2.5 w-1/3 shimmer rounded-full" />
                <div className="h-3 w-2/3 shimmer rounded" />
                <div className="h-4 w-1/3 shimmer rounded" />
              </CardContent>
            </Card>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full">
            <div className="relative mx-auto flex max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-rose-200/70 bg-gradient-to-br from-rose-50/60 to-amber-50/40 px-6 py-16 text-center">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-300/20 blur-2xl" aria-hidden />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-rose-100 shadow-sm backdrop-blur-sm">
                <PackageSearch className="h-7 w-7 text-rose-500" />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{t("shop.noResultsTitle")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("shop.noResultsDesc")}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-rose-200 text-rose-700 hover:bg-rose-50"
                onClick={() => { setQ(""); setCat("All"); setSort("featured") }}
              >
                {t("shop.clearFilters")}
              </Button>
            </div>
          </div>
        ) : (
          products.map((p) => (
            <Card
              key={p.id}
              className="card-hover group relative cursor-pointer overflow-hidden rounded-2xl border-rose-100/70 py-0 shadow-sm transition-all duration-300 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/10"
              onClick={() => navigate({ name: "product_detail", productId: p.id })}
            >
              {/* Image area */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50/60">
                {/* Decorative orb */}
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-rose-300/40 via-rose-200/30 to-amber-200/20 opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden
                />
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="relative h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="relative flex h-full items-center justify-center">
                    <Leaf className="h-14 w-14 text-rose-300/70" />
                  </div>
                )}
                {/* Subtle bottom gradient for depth */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/5 to-transparent"
                  aria-hidden
                />

                {/* Low-stock badge — amber gradient pill */}
                {p.stock <= 5 && p.stock > 0 && (
                  <div className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-200/90 to-amber-100/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800 shadow-sm backdrop-blur-sm">
                    <span className="h-1 w-1 rounded-full bg-amber-500" />
                    {t("shop.onlyLeft", { n: p.stock })}
                  </div>
                )}

                {/* Out-of-stock — elegant overlay */}
                {p.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                    <span className="rounded-full border border-rose-200 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 shadow-sm">
                      {t("shop.outOfStock")}
                    </span>
                  </div>
                )}

                {/* Premium add-to-cart CTA — icon that morphs to labeled button on hover */}
                {p.stock > 0 && (
                  <div className="absolute inset-x-3 bottom-3 flex justify-end">
                    <Button
                      size="sm"
                      className="h-10 gap-0 overflow-hidden rounded-full bg-white/90 px-2.5 text-rose-700 shadow-lg shadow-rose-500/20 backdrop-blur-md transition-all duration-300 hover:bg-white group-hover:gap-2 group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:to-rose-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-rose-500/30"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAdd(p)
                      }}
                      aria-label={t("productDetail.addToCart")}
                    >
                      <Plus className="h-4 w-4 shrink-0" />
                      <span className="max-w-0 overflow-hidden whitespace-nowrap pe-1 text-xs font-semibold opacity-0 transition-all duration-300 group-hover:max-w-[100px] group-hover:opacity-100">
                        {t("shop.addShort")}
                      </span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Info */}
              <CardContent className="space-y-1.5 p-4">
                {p.category && (
                  <div className="text-[10px] font-medium uppercase tracking-wider text-rose-700/60">
                    {p.category.name}
                  </div>
                )}
                <div className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug tracking-tight transition-colors group-hover:text-rose-700">
                  {p.name}
                </div>
                <div className="pt-1">
                  <span className="text-gradient-rose text-base font-bold tracking-tight sm:text-lg">
                    {formatMoney(p.price)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
