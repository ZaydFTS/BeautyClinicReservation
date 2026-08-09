"use client"

import { useQuery } from"@tanstack/react-query"
import { useNav } from"@/store/nav"
import { useLang } from"@/store/lang"
import { apiGet } from"@/lib/api-client"
import { formatMoney } from"@/lib/format"
import { SERVICE_CATEGORIES } from"@/lib/constants"
import { Button } from"@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Input } from"@/components/ui/input"
import { Calendar, Clock, Search, ArrowRight, Sparkles, Scissors, MessageCircle } from"lucide-react"
import { useState } from"react"

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  durationMin: number
  category: string
  imageUrl: string | null
  active: boolean
}

export function ServicesPage() {
  const navigate = useNav((s) => s.navigate)
  const t = useLang((s) => s.t)
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<string>("All")

  const { data, isLoading } = useQuery({
    queryKey: ["services","active"],
    queryFn: () => apiGet<{ services: Service[] }>("/api/services?active=true"),
  })

  const services = data?.services || []
  const filtered = services.filter((s) => {
    if (cat !=="All" && s.category !== cat) return false
    if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 bg-blush text-secondary">
          {t("servicesPage.badge")}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">{t("servicesPage.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {t("servicesPage.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {["All", ...SERVICE_CATEGORIES].map((c) => (
            <Button
              key={c}
              size="sm"
              variant={cat === c ?"default" :"outline"}
              onClick={() => setCat(c)}
              className={`press-feedback rounded-full ${
                cat === c
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "border-outline-variant text-secondary hover:border-primary hover:bg-blush hover:text-primary"
              }`}
            >
              {c}
            </Button>
          ))}
        </div>
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

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-2xl border-outline-variant/70">
              <div className="relative h-32 shimmer bg-blush">
                <div className="absolute right-3 top-3 h-6 w-16 shimmer rounded-full opacity-60" />
                <div className="absolute right-3 top-12 h-6 w-12 shimmer rounded opacity-60" />
              </div>
              <CardContent className="p-5">
                <div className="h-5 w-2/3 shimmer rounded" />
                <div className="mt-2 h-3 w-full shimmer rounded" />
                <div className="mt-1.5 h-3 w-4/5 shimmer rounded" />
                <div className="mt-4 h-8 w-full shimmer rounded-md" />
              </CardContent>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full">
            <div className="relative mx-auto flex max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-outline-variant/70 bg-blush p-8">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary-container/20 blur-2xl" aria-hidden />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-primary/15 shadow-sm backdrop-blur-sm">
                <Scissors className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{t("servicesPage.noResultsTitle")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("servicesPage.noResultsDesc")}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="press-feedback mt-4 border-outline-variant text-secondary hover:border-primary hover:bg-primary hover:text-white"
                onClick={() => { setQ(""); setCat("All") }}
              >
                {t("servicesPage.clearFilters")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {filtered.map((svc) => (
              <Card
                key={svc.id}
                className="card-lift group relative flex flex-col gap-0 overflow-hidden rounded-2xl border-outline-variant/70 py-0 shadow-sm hover:border-primary hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Service image with img-zoom skill utility */}
                {svc.imageUrl && (
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-blush">
                    <img
                      src={svc.imageUrl}
                      alt={svc.name}
                      className="img-zoom h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-black/20" />
                    <Badge
                      className="absolute left-3 top-3 border-none bg-white/90 px-2.5 py-1 text-xs font-medium text-secondary shadow-sm backdrop-blur-md hover:bg-white/90"
                    >
                      {svc.category}
                    </Badge>
                  </div>
                )}
                <CardHeader className={`relative overflow-hidden p-5 pb-4 ${svc.imageUrl ?"" :"bg-blush"}`}>
                  {/* Decorative orb - only when no image */}
                  {!svc.imageUrl && (
                    <>
                      <div
                        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15"
                        aria-hidden
                      />
                      <Sparkles
                        className="pointer-events-none absolute right-4 top-4 h-5 w-5 text-primary/40 transition-colors group-hover:text-primary/70"
                        aria-hidden
                      />
                      <Badge
                        className="relative border-none bg-white/80 px-2.5 py-1 text-xs font-medium text-secondary shadow-sm backdrop-blur-md hover:bg-white/80"
                      >
                        {svc.category}
                      </Badge>
                    </>
                  )}
                  <div className="relative flex items-start justify-end gap-3">
                    <div className="text-end">
                      <div className="text-primary text-2xl font-bold tracking-tight">
                        {formatMoney(svc.price)}
                      </div>
                      <div className="mt-0.5 flex items-center justify-end gap-1 text-xs text-secondary">
                        <Clock className="h-3 w-3" />
                        {svc.durationMin} {t("nav.treatmentDuration")}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="relative mt-3 text-xl font-semibold tracking-tight transition-colors group-hover:text-secondary">
                    {svc.name}
                  </CardTitle>
                  {svc.description && (
                    <CardDescription className="relative mt-1.5 line-clamp-3 leading-relaxed">
                      {svc.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter className="flex gap-2 p-5 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="press-feedback flex-1 border-outline-variant/70 text-secondary hover:border-primary hover:bg-blush hover:text-primary"
                    onClick={() => navigate({ name:"service_detail", serviceId: svc.id })}
                  >
                    {t("servicesPage.details")}
                  </Button>
                  <Button
                    size="sm"
                    className="btn-press flex-1 bg-primary text-white hover:bg-primary/90"
                    onClick={() => navigate({ name:"booking", serviceId: svc.id })}
                  >
                    <Calendar className="me-1.5 h-4 w-4" />
                    {t("servicesPage.book")}
                    <ArrowRight className="arrow-slide ms-1.5 h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Consultation CTA card - spans full width on its row */}
            <div className="relative overflow-hidden rounded-2xl bg-secondary p-6 text-white sm:col-span-2 lg:col-span-3">
              {/* Decorative orbs for depth */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-container/20 blur-2xl" aria-hidden />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5 blur-2xl" aria-hidden />

              <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold tracking-tight">
                      Not sure which treatment is right for you?
                    </h3>
                    <p className="mt-1 text-sm text-white/80">
                      Book a complimentary consultation with our beauty experts and we&apos;ll craft the perfect plan for your skin.
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => navigate({ name:"contact" })}
                  className="btn-press flex-shrink-0 bg-white text-secondary hover:bg-blush"
                >
                  Book a Consultation
                  <ArrowRight className="arrow-slide ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
