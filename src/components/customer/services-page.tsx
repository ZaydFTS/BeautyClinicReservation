"use client"

import { useQuery } from "@tanstack/react-query"
import { useNav } from "@/store/nav"
import { useLang } from "@/store/lang"
import { apiGet } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { useDiscount, calculateDiscountedPrice, getDiscount, type DiscountConfig } from "@/lib/discount"
import { SERVICE_CATEGORIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Search, ArrowRight, ArrowUpRight, Sparkles, Scissors, MessageCircle, HandHeart } from "lucide-react"
import { useState, useMemo } from "react"
import { Reveal } from "@/components/shared/reveal"

interface Service {
  id: string
  name: string
  nameAr: string | null
  description: string | null
  descriptionAr: string | null
  price: number
  durationMin: number
  category: string
  categoryId: string | null
  imageUrl: string | null
  active: boolean
}

// Map categories to numbered section labels (R&R style: "01 // REJUVENATE")
const SECTION_LABELS: Record<string, string> = {
  Waxing: "01 // SMOOTH",
  Laser: "01 // SMOOTH",
  Skincare: "02 // REJUVENATE",
  Facials: "02 // REJUVENATE",
  Injectables: "03 // ENHANCE",
  Body: "03 // SCULPT",
  Other: "04 // DISCOVER",
}

const SECTION_ORDER = ["Waxing", "Laser", "Skincare", "Facials", "Injectables", "Body", "Other"]

export function ServicesPage() {
  const navigate = useNav((s) => s.navigate)
  const t = useLang((s) => s.t)
  const lang = useLang((s) => s.lang)
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<string>("All")

  const { data, isLoading } = useQuery({
    queryKey: ["services", "active"],
    queryFn: () => apiGet<{ services: Service[] }>("/api/services?active=true"),
  })
  const { data: discountData } = useDiscount()
  const discount: DiscountConfig = getDiscount(discountData?.discount)

  const services = data?.services || []

  const filtered = services.filter((s) => {
    if (cat !== "All" && s.category !== cat) return false
    if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  // Group filtered services by category, preserving SECTION_ORDER
  const grouped = useMemo(() => {
    const map = new Map<string, Service[]>()
    for (const svc of filtered) {
      const key = svc.category || "Other"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(svc)
    }
    // Sort categories by SECTION_ORDER
    return Array.from(map.entries()).sort((a, b) => {
      const ia = SECTION_ORDER.indexOf(a[0])
      const ib = SECTION_ORDER.indexOf(b[0])
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    })
  }, [filtered])

  return (
    <div className="flex flex-col">
      {/* ============================================================
          HERO - R&R style asymmetric two-column with treatment room image
          ============================================================ */}
      <section className="relative overflow-hidden bg-blush">
        {/* Decorative blurred orbs */}
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left column - text */}
            <div className="animate-fade-in-up">
              {/* Eyebrow */}
              <div className="mb-5 flex items-center gap-2">
                <span className="h-px w-8 bg-primary" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {t("servicesPage.badge")}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-balance font-serif text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                Curated Treatments for{" "}
                <span className="italic text-primary">Radiant Results</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
                {t("servicesPage.subtitle")}
              </p>

              {/* Quick stats */}
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blush">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{services.length}+</div>
                    <div className="text-xs text-muted-foreground">Treatments</div>
                  </div>
                </div>
                <div className="h-8 w-px bg-outline-variant" aria-hidden />
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blush">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">Real-time</div>
                    <div className="text-xs text-muted-foreground">Slot booking</div>
                  </div>
                </div>
                <div className="h-8 w-px bg-outline-variant" aria-hidden />
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blush">
                    <HandHeart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">Certified</div>
                    <div className="text-xs text-muted-foreground">Specialists</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - treatment room image */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              <div className="relative mx-auto max-w-md">
                {/* Background blur orbs */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-container/30 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-primary/15 blur-3xl" aria-hidden />

                {/* Image card */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-outline-variant bg-blush shadow-2xl shadow-primary/20">
                  <img
                    src="/hero/services-room.png"
                    alt="Luxury treatment room at the beauty clinic"
                    className="img-zoom h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/5" aria-hidden />
                </div>

                {/* Floating badge - top right */}
                <div className="absolute -right-3 top-8 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-primary/30 sm:-right-6">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  Luxury Spa
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FILTER + SEARCH BAR - sticky
          ============================================================ */}
      <section className="sticky top-16 z-30 border-y border-outline-variant/60 bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {["All", ...SERVICE_CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`press-feedback rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  cat === c
                    ? "bg-primary text-white shadow-sm shadow-primary/25"
                    : "border border-outline-variant text-secondary hover:border-primary hover:bg-blush hover:text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("servicesPage.searchPlaceholder")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border-outline-variant bg-card ps-9 focus-visible:border-primary"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          SERVICES - grouped by category (R&R style numbered sections)
          ============================================================ */}
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl border-outline-variant/70">
                <div className="h-48 shimmer" />
                <CardContent className="space-y-3 p-6">
                  <div className="h-4 w-1/3 shimmer rounded" />
                  <div className="h-6 w-2/3 shimmer rounded" />
                  <div className="h-3 w-full shimmer rounded" />
                  <div className="h-3 w-4/5 shimmer rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="relative mx-auto flex max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-outline-variant/70 bg-blush p-12">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary-container/20 blur-2xl" aria-hidden />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-primary/15 shadow-sm backdrop-blur-sm">
              <Scissors className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">{t("servicesPage.noResultsTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("servicesPage.noResultsDesc")}</p>
            <Button
              variant="outline"
              size="sm"
              className="press-feedback mt-4 border-outline-variant text-secondary hover:border-primary hover:bg-primary hover:text-white"
              onClick={() => { setQ(""); setCat("All") }}
            >
              {t("servicesPage.clearFilters")}
            </Button>
          </div>
        ) : (
          <div className="space-y-20">
            {grouped.map(([category, categoryServices], sectionIdx) => {
              const sectionLabel = SECTION_LABELS[category] || `${String(sectionIdx + 1).padStart(2, "0")} // DISCOVER`
              // Alternate background per section for visual rhythm
              const isAltBg = sectionIdx % 2 === 1

              return (
                <Reveal key={category}>
                  <section className={isAltBg ? "-mx-4 px-4 py-12 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-blush rounded-3xl" : ""}>
                    {/* Section header - R&R style */}
                    <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="h-px w-8 bg-primary" aria-hidden />
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                            {sectionLabel}
                          </span>
                        </div>
                        <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                          {category}
                        </h2>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {categoryServices.length} {categoryServices.length === 1 ? "treatment" : "treatments"}
                      </div>
                    </div>

                    {/* Cards grid - 3 columns on desktop */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryServices.map((svc, i) => (
                        <Reveal key={svc.id} delay={i * 100}>
                          <Card
                            className="card-lift group relative flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-outline-variant/70 bg-card py-0 shadow-none transition-all duration-300 hover:border-primary"
                          >
                            {/* Image area */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-blush">
                              {svc.imageUrl ? (
                                <img
                                  src={svc.imageUrl}
                                  alt={lang === "ar" && svc.nameAr ? svc.nameAr : svc.name}
                                  className="img-zoom h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Sparkles className="h-12 w-12 text-primary/30" />
                                </div>
                              )}
                              {/* Duration badge - top right (R&R style circular pill) */}
                              <div className="absolute right-3 top-3">
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                                  <Clock className="h-2.5 w-2.5" />
                                  {svc.durationMin} MIN
                                </span>
                              </div>
                              {/* Category badge - top left */}
                              <div className="absolute left-3 top-3">
                                <span className="inline-flex items-center rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary shadow-sm backdrop-blur-md">
                                  {svc.category}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <CardHeader className="p-6 pb-3">
                              <CardTitle className="font-serif text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-secondary">
                                {lang === "ar" && svc.nameAr ? svc.nameAr : svc.name}
                              </CardTitle>
                              {(lang === "ar" && svc.descriptionAr ? svc.descriptionAr : svc.description) && (
                                <CardDescription className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                  {lang === "ar" && svc.descriptionAr ? svc.descriptionAr : svc.description}
                                </CardDescription>
                              )}
                            </CardHeader>

                            {/* Footer - price + book link */}
                            <CardFooter className="mt-auto flex items-center justify-between p-6 pt-0">
                              <div>
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  From
                                </div>
                                {(() => {
                                  const priceInfo = calculateDiscountedPrice(svc.price, discount, "service", svc.categoryId)
                                  return (
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg font-bold text-primary">
                                        {formatMoney(priceInfo.discounted)}
                                      </span>
                                      {priceInfo.hasDiscount && (
                                        <span className="text-sm text-muted-foreground line-through">
                                          {formatMoney(priceInfo.original)}
                                        </span>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                              <button
                                onClick={() => navigate({ name: "booking", serviceId: svc.id })}
                                className="press-feedback group/btn inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-secondary"
                              >
                                Book
                                <ArrowRight className="arrow-slide h-3.5 w-3.5" />
                              </button>
                            </CardFooter>
                          </Card>
                        </Reveal>
                      ))}
                    </div>
                  </section>
                </Reveal>
              )
            })}

            {/* ============================================================
                CONSULTATION CTA - R&R style solid secondary card
                ============================================================ */}
            <Reveal>
              <section className="relative overflow-hidden rounded-3xl bg-secondary px-6 py-12 text-white sm:px-12 sm:py-16">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" aria-hidden />

                <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-5 max-w-2xl">
                    {/* Icon */}
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                      <MessageCircle className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="h-px w-6 bg-white/40" aria-hidden />
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                          Personalized Care
                        </span>
                      </div>
                      <h3 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Not sure where to start?
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-white/85">
                        Book a complimentary consultation with our aesthetic specialists to design your personalized treatment plan.
                      </p>
                    </div>
                  </div>

                  {/* CTA button - inverted (white bg, secondary text) */}
                  <Button
                    size="lg"
                    onClick={() => navigate({ name: "contact" })}
                    className="btn-press flex-shrink-0 rounded-full bg-white px-8 text-base font-semibold text-secondary shadow-lg hover:bg-blush"
                  >
                    Book Consultation
                    <ArrowRight className="arrow-slide ml-2 h-4 w-4" />
                  </Button>
                </div>
              </section>
            </Reveal>
          </div>
        )}
      </div>
    </div>
  )
}
