"use client"

import { useQuery } from "@tanstack/react-query"
import { useNav } from "@/store/nav"
import { useLang } from "@/store/lang"
import { useCart } from "@/store/cart"
import { apiGet } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { useDiscount, calculateDiscountedPrice, getDiscount, type DiscountConfig } from "@/lib/discount"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ShoppingBag, Search, Plus, Leaf, PackageSearch, ArrowRight, RotateCcw, Heart, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Reveal } from "@/components/shared/reveal"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
  categoryId: string | null
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
  const [page, setPage] = useState(1)
  const pageSize = 9

  // Build query URL with server-side pagination, filtering, and sorting
  const queryParams = new URLSearchParams({
    active: "true",
    page: String(page),
    limit: String(pageSize),
    sort,
  })
  if (cat !== "All") queryParams.set("categoryId", cat)
  if (q) queryParams.set("q", q)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", "paginated", cat, q, sort, page],
    queryFn: () => apiGet<{ products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/api/products?${queryParams.toString()}`),
  })
  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<{ categories: Category[] }>("/api/categories"),
  })
  const { data: discountData } = useDiscount()
  const discount: DiscountConfig = getDiscount(discountData?.discount)

  const products = productsData?.products || []
  const pagination = productsData?.pagination
  const totalPages = pagination?.totalPages || 1
  const currentPage = pagination?.page || 1
  const totalCount = pagination?.total || 0
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + products.length, totalCount)

  // Reset to page 1 when filters/search/sort change
  const resetPage = () => setPage(1)

  const handleAdd = (p: Product) => {
    addItem({
      productId: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      stock: p.stock,
      categoryId: p.categoryId,
    })
    toast.success(t("shop.addedToCart", { name: p.name }))
  }

  const categories = catData?.categories || []

  return (
    <div className="flex flex-col">
      {/* ============================================================
          HERO - R&R style centered with eyebrow
          ============================================================ */}
      <section className="relative overflow-hidden bg-blush">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-primary" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <ShoppingBag className="mr-1 inline h-3 w-3" />
              {t("shop.badge")}
            </span>
            <span className="h-px w-8 bg-primary" aria-hidden />
          </div>
          <h1 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            {t("shop.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
            {t("shop.subtitle")}
          </p>
        </div>
      </section>

      {/* ============================================================
          MAIN LAYOUT - sidebar filters + product grid
          ============================================================ */}
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Left sidebar - filters */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("shop.searchPlaceholder")}
                  value={q}
                  onChange={(e) => { setQ(e.target.value); resetPage() }}
                  className="border-outline-variant bg-card pl-9 focus-visible:border-primary"
                />
              </div>

              {/* Categories */}
              <div className="rounded-2xl border border-outline-variant/60 bg-card p-5">
                <h3 className="font-serif text-lg font-bold tracking-tight text-foreground">Category</h3>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => { setCat("All"); resetPage() }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                      cat === "All" ? "bg-blush font-semibold text-primary" : "text-muted-foreground hover:bg-blush/50 hover:text-foreground"
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-xs opacity-70">{totalCount}</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setCat(c.id); resetPage() }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                        cat === c.id ? "bg-blush font-semibold text-primary" : "text-muted-foreground hover:bg-blush/50 hover:text-foreground"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-xs opacity-70">{c._count?.products || 0}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset filters */}
              {(cat !== "All" || q) && (
                <button
                  onClick={() => { setQ(""); setCat("All"); setSort("featured") }}
                  className="press-feedback flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/60 bg-card px-4 py-2.5 text-xs font-semibold text-secondary transition hover:border-primary hover:bg-blush hover:text-primary"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Filters
                </button>
              )}
            </div>
          </aside>

          {/* Right - product grid */}
          <div className="lg:col-span-3">
            {/* Sort bar */}
            <div className="mb-6 flex items-center justify-between rounded-xl border border-outline-variant/60 bg-card px-4 py-3">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{products.length === 0 ? 0 : startIndex + 1}–{endIndex}</span> of {totalCount} products
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort by:</span>
                <Select value={sort} onValueChange={(v) => { setSort(v); resetPage() }}>
                  <SelectTrigger className="h-8 w-36 border-none bg-transparent text-sm font-medium shadow-none focus:ring-0">
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
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-2xl border-outline-variant/70 shadow-none">
                    <div className="aspect-[4/5] shimmer" />
                    <CardContent className="space-y-2 p-5">
                      <div className="h-2.5 w-1/3 shimmer rounded-full" />
                      <div className="h-4 w-2/3 shimmer rounded" />
                      <div className="h-3 w-full shimmer rounded" />
                      <div className="h-5 w-1/3 shimmer rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-outline-variant/70 bg-blush p-16">
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary-container/20 blur-2xl" aria-hidden />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-primary/15 shadow-sm backdrop-blur-sm">
                  <PackageSearch className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold tracking-tight">{t("shop.noResultsTitle")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("shop.noResultsDesc")}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="press-feedback mt-4 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => { setQ(""); setCat("All"); setSort("featured") }}
                >
                  {t("shop.clearFilters")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p, i) => {
                  const priceInfo = calculateDiscountedPrice(p.price, discount, "product", p.categoryId)
                  return (
                    <Reveal key={p.id} delay={i * 80}>
                      <Card
                        className="card-lift group relative cursor-pointer overflow-hidden rounded-2xl border-outline-variant/70 bg-card py-0 shadow-none transition-all duration-300 hover:border-primary"
                        onClick={() => navigate({ name: "product_detail", productId: p.id })}
                      >
                        {/* Image area - 4:5 portrait */}
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-blush">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="img-zoom h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Leaf className="h-14 w-14 text-primary/25" />
                            </div>
                          )}

                          {/* Discount badge */}
                          {priceInfo.hasDiscount && (
                            <div className="absolute left-3 top-3">
                              <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                                -{priceInfo.percent}%
                              </span>
                            </div>
                          )}

                          {/* Low-stock badge */}
                          {p.stock <= 5 && p.stock > 0 && (
                            <div className="absolute right-3 top-3">
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary shadow-sm backdrop-blur-md">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Only {p.stock} left
                              </span>
                            </div>
                          )}

                          {/* Out-of-stock overlay */}
                          {p.stock === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                              <span className="rounded-full border border-outline-variant bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary shadow-sm">
                                {t("shop.outOfStock")}
                              </span>
                            </div>
                          )}

                          {/* Add to cart - icon that morphs to labeled button on hover */}
                          {p.stock > 0 && (
                            <div className="absolute inset-x-3 bottom-3 flex justify-end">
                              <Button
                                size="sm"
                                className="press-feedback h-10 gap-0 overflow-hidden rounded-full bg-white/90 px-2.5 text-secondary shadow-lg shadow-primary/20 backdrop-blur-md transition-all duration-300 hover:bg-white group-hover:gap-2 group-hover:bg-primary group-hover:text-white"
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

                        {/* Content */}
                        <CardContent className="space-y-2 p-5">
                          {/* Category label */}
                          {p.category && (
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                              {p.category.name}
                            </div>
                          )}

                          {/* Title - Playfair serif */}
                          <h3 className="font-serif text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-secondary">
                            {p.name}
                          </h3>

                          {/* Description */}
                          {p.description && (
                            <p className="line-clamp-1 text-xs leading-relaxed text-muted-foreground">
                              {p.description}
                            </p>
                          )}

                          {/* Price */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-lg font-bold text-primary">
                              {formatMoney(priceInfo.discounted)}
                            </span>
                            {priceInfo.hasDiscount && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatMoney(priceInfo.original)}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Reveal>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !isLoading && products.length > 0 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {/* Previous button */}
                <button
                  onClick={() => { setPage(currentPage - 1); window.scrollTo({ top: 200, behavior: "smooth" }) }}
                  disabled={currentPage === 1}
                  className="press-feedback flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-card text-secondary transition hover:border-primary hover:bg-blush hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-outline-variant disabled:hover:bg-card disabled:hover:text-secondary"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => { setPage(pageNum); window.scrollTo({ top: 200, behavior: "smooth" }) }}
                    className={`press-feedback flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
                      pageNum === currentPage
                        ? "bg-primary text-white shadow-sm shadow-primary/25"
                        : "border border-outline-variant bg-card text-secondary hover:border-primary hover:bg-blush hover:text-primary"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Next button */}
                <button
                  onClick={() => { setPage(currentPage + 1); window.scrollTo({ top: 200, behavior: "smooth" }) }}
                  disabled={currentPage === totalPages}
                  className="press-feedback flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-card text-secondary transition hover:border-primary hover:bg-blush hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-outline-variant disabled:hover:bg-card disabled:hover:text-secondary"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
