"use client"

import { useQuery } from"@tanstack/react-query"
import { useNav } from"@/store/nav"
import { useLang } from"@/store/lang"
import { apiGet } from"@/lib/api-client"
import { CLINIC_NAME, CLINIC_HOURS } from"@/lib/constants"
import { formatMoney } from"@/lib/format"
import { Button } from"@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import {
  Sparkles, Calendar, ShoppingBag, ShieldCheck, Clock, MapPin, Phone,
  ArrowRight, Star, Heart, Leaf, Award, ChevronRight,
} from"lucide-react"

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

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
}

export function HomePage() {
  const navigate = useNav((s) => s.navigate)
  const t = useLang((s) => s.t)

  const { data: servicesData } = useQuery({
    queryKey: ["services","active"],
    queryFn: () => apiGet<{ services: Service[] }>("/api/services?active=true"),
  })
  const { data: productsData } = useQuery({
    queryKey: ["products","active"],
    queryFn: () => apiGet<{ products: Product[] }>("/api/products?active=true"),
  })

  const services = (servicesData?.services || []).slice(0, 6)
  const products = (productsData?.products || []).slice(0, 4)

  return (
    <div className="flex flex-col">
      {/* Hero - asymmetric two-column with floating stats card */}
      <section className="bg-blush relative overflow-hidden">
        {/* Decorative blurred blobs */}
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-5">
            {/* Left column (60%) */}
            <div className="lg:col-span-3">
              <Badge variant="secondary" className="mb-6 animate-fade-in-up bg-white text-secondary hover:bg-white">
                <Sparkles className="mr-1.5 h-3 w-3" />
                Premium Laser &amp; Beauty Clinic
              </Badge>
              <h1 className="animate-fade-in-up text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl" style={{ animationDelay:"0.05s" }}>
                {t("home.heroTitle1")}{" "}
                <span className="text-primary">
                  {t("home.heroTitle2")}
                </span>
              </h1>
              <p className="mt-6 max-w-xl animate-fade-in-up text-balance text-lg leading-relaxed text-muted-foreground" style={{ animationDelay:"0.1s" }}>
                {t("home.heroSubtitle")}
              </p>
              <div className="mt-9 flex animate-fade-in-up flex-col gap-3 sm:flex-row" style={{ animationDelay:"0.15s" }}>
                <Button
                  size="lg"
                  onClick={() => navigate({ name:"booking" })}
                  className="btn-press btn-shimmer w-full bg-primary text-white hover:bg-primary/90 sm:w-auto"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  {t("nav.bookAppointment")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ name:"services" })}
                  className="press-feedback w-full border-outline-variant text-secondary hover:border-primary hover:bg-white hover:text-primary sm:w-auto"
                >
                  {t("home.exploreServices")}
                  <ArrowRight className="arrow-slide ml-2 h-4 w-4" />
                </Button>
              </div>
              {/* 5-star rating row */}
              <div className="mt-9 flex animate-fade-in-up items-center gap-3" style={{ animationDelay:"0.2s" }}>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">{t("home.rating")}</span>
                <span className="text-sm text-muted-foreground">· {t("home.happyClients")}</span>
              </div>
            </div>

            {/* Right column (40%) - floating visual card */}
            <div className="lg:col-span-2">
              <div className="relative mx-auto max-w-sm">
                {/* Background blur orbs */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" aria-hidden />

                {/* Primary visual card (no image, solid bg-primary) */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-primary">
                  {/* Decorative inner orbs for depth */}
                  <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-container/30 blur-2xl" aria-hidden />
                  <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden />

                  {/* Inner content */}
                  <div className="relative flex h-full flex-col justify-between p-7 text-white">
                    <div className="flex items-center justify-between">
                      <Badge className="border-none bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md hover:bg-white/20">
                        <Sparkles className="mr-1.5 h-3 w-3" />
                        {CLINIC_NAME}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="h-4 w-4 fill-white text-white" />
                        ))}
                      </div>
                      <p className="font-serif text-2xl font-semibold leading-snug">
                        “Reveal your smoothest, most confident self.”
                      </p>
                      <p className="text-sm text-white/80">
                        {CLINIC_HOURS.split("·")[0]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating stats card overlapping bottom-left corner */}
                <div className="absolute -bottom-6 -left-4 w-56 rounded-2xl border border-outline-variant bg-white p-4 shadow-lg shadow-primary/10 sm:-left-8">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-2xl font-bold text-primary">2,400+</div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Happy Clients
                      </div>
                    </div>
                    <div className="border-l border-outline-variant pl-3">
                      <div className="flex items-center gap-1 text-2xl font-bold text-secondary">
                        4.9
                        <Star className="h-4 w-4 fill-secondary text-secondary" />
                      </div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Rating
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-outline-variant/60 bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: ShieldCheck, title: t("home.trust1Title"), desc: t("home.trust1Desc") },
            { icon: Award, title: t("home.trust2Title"), desc: t("home.trust2Desc") },
            { icon: Clock, title: t("home.trust3Title"), desc: CLINIC_HOURS.split("·")[0] },
            { icon: Heart, title: t("home.trust4Title"), desc: t("home.trust4Desc") },
          ].map((item, i) => (
            <div
              key={item.title}
              className="card-lift flex items-start gap-3 rounded-lg p-2"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blush">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured services */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <Badge variant="secondary" className="mb-2 bg-blush text-secondary">
              {t("home.treatments")}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">{t("home.popularTreatments")}</h2>
            <p className="mt-2 text-muted-foreground">
              {t("home.popularDesc")}
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate({ name:"services" })} className="press-feedback hidden text-secondary hover:bg-blush hover:text-primary sm:inline-flex">
            {t("home.viewAll")}
            <ChevronRight className="arrow-slide ml-1 h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate({ name:"services" })} className="press-feedback text-secondary hover:bg-blush hover:text-primary sm:hidden" aria-label={t("home.viewAll")}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl border-outline-variant/70">
                <div className="h-32 shimmer" />
                <CardContent className="p-4">
                  <div className="h-4 w-2/3 shimmer rounded" />
                  <div className="mt-2 h-3 w-full shimmer rounded" />
                  <div className="mt-2 h-3 w-1/2 shimmer rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            services.map((svc, i) => {
              const isFeatured = i === 2
              return (
                <Card
                  key={svc.id}
                  className={`card-lift group animate-fade-in-up relative cursor-pointer gap-0 overflow-hidden rounded-2xl border py-0 shadow-sm hover:shadow-xl hover:shadow-primary/10 ${
                    isFeatured
                      ? "border-primary bg-primary text-white hover:border-primary"
                      : "border-outline-variant/70 hover:border-primary"
                  }`}
                  onClick={() => navigate({ name:"service_detail", serviceId: svc.id })}
                  style={{ animationDelay: `${i * 0.05}s` }}
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
                    </div>
                  )}
                  <CardHeader className={`relative overflow-hidden p-5 ${svc.imageUrl ?"" :"bg-blush"}`}>
                    {/* Decorative orb - only when no image */}
                    {!svc.imageUrl && (
                      <>
                        <div
                          className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full ${isFeatured ?"bg-white/10" :"bg-primary/15"}`}
                          aria-hidden
                        />
                        <Sparkles
                          className={`pointer-events-none absolute right-4 top-4 h-5 w-5 transition-colors ${isFeatured ?"text-white/50 group-hover:text-white" :"text-primary/40 group-hover:text-primary/70"}`}
                          aria-hidden
                        />
                      </>
                    )}
                    <div className="relative flex items-start justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={`px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-md ${
                          isFeatured
                            ? "border-white/30 bg-white/20 text-white"
                            : "border-white/60 bg-white/70 text-secondary"
                        }`}
                      >
                        {svc.category}
                      </Badge>
                      <div className="text-right">
                        <div className={`text-lg font-bold tracking-tight ${isFeatured ?"text-white" :"text-primary"}`}>
                          {formatMoney(svc.price)}
                        </div>
                        <div className={`mt-0.5 flex items-center justify-end gap-0.5 text-xs ${isFeatured ?"text-white/70" :"text-secondary/70"}`}>
                          <Clock className="h-3 w-3" />
                          {svc.durationMin} {t("nav.treatmentDuration")}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <CardTitle className={`text-base font-semibold tracking-tight transition-colors ${isFeatured ?"text-white group-hover:text-white" :"group-hover:text-secondary"}`}>
                      {svc.name}
                    </CardTitle>
                    {svc.description && (
                      <CardDescription className={`mt-1.5 line-clamp-2 leading-relaxed ${isFeatured ?"text-white/80" :""}`}>
                        {svc.description}
                      </CardDescription>
                    )}
                  </CardContent>
                  <CardFooter className="p-5 pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className={`press-feedback w-full border transition-all duration-300 ${
                        isFeatured
                          ? "border-transparent bg-white text-primary hover:bg-white/90"
                          : "border-outline-variant/70 text-secondary hover:border-primary hover:bg-primary hover:text-white"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate({ name:"booking", serviceId: svc.id })
                      }}
                    >
                      {t("home.bookThisTreatment")}
                      <ArrowRight className="arrow-slide ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>
      </section>

      {/* Shop preview */}
      <section className="bg-blush">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <Badge variant="secondary" className="mb-2 bg-white text-secondary">
                <ShoppingBag className="mr-1 h-3 w-3" />
                Shop
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">{t("home.aftercareTitle")}</h2>
              <p className="mt-2 text-muted-foreground">
                Professional-grade products to extend your results at home.
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate({ name:"shop" })} className="press-feedback hidden text-secondary hover:bg-white hover:text-primary sm:inline-flex">
              {t("home.shopAll")}
              <ChevronRight className="arrow-slide ml-1 h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate({ name:"shop" })} className="press-feedback text-secondary hover:bg-white hover:text-primary sm:hidden" aria-label={t("home.shopAll")}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-2xl border-outline-variant/70">
                  <div className="aspect-square shimmer" />
                  <CardContent className="space-y-2 p-4">
                    <div className="h-3 w-2/3 shimmer rounded" />
                    <div className="h-4 w-1/3 shimmer rounded" />
                  </CardContent>
                </Card>
              ))
            ) : (
              products.map((p, i) => (
                <Card
                  key={p.id}
                  className="card-lift group animate-fade-in-up relative cursor-pointer overflow-hidden rounded-2xl border-outline-variant/70 py-0 shadow-sm hover:border-primary hover:shadow-xl hover:shadow-primary/10"
                  onClick={() => navigate({ name:"product_detail", productId: p.id })}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Image area */}
                  <div className="relative aspect-square overflow-hidden bg-blush">
                    {/* Decorative orb */}
                    <div
                      className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/15"
                      aria-hidden
                    />
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="img-zoom relative h-full w-full object-cover"
                      />
                    ) : (
                      <div className="relative flex h-full items-center justify-center">
                        <Leaf className="h-14 w-14 text-primary-container/70" />
                      </div>
                    )}
                    {/* Subtle bottom overlay for depth */}
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-black/10"
                      aria-hidden
                    />

                    {/* Low-stock badge */}
                    {p.stock <= 5 && p.stock > 0 && (
                      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-white/90 px-2.5 py-1 text-xs font-medium text-secondary backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Only {p.stock} left
                      </div>
                    )}

                    {/* Out-of-stock overlay */}
                    {p.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                        <span className="rounded-full border border-outline-variant bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary shadow-sm">
                          Out of stock
                        </span>
                      </div>
                    )}

                    {/* Hover"View" affordance — visible on mobile (no hover), reveal-on-hover on desktop */}
                    <div className="absolute inset-x-3 bottom-3 flex translate-y-0 justify-end opacity-100 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      <span className="inline-flex h-9 items-center gap-1 rounded-full bg-white/90 px-3 text-xs font-semibold text-secondary shadow-lg shadow-primary/20 backdrop-blur-md">
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <CardContent className="space-y-1.5 p-4">
                    <div className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug tracking-tight transition-colors group-hover:text-secondary">
                      {p.name}
                    </div>
                    <div className="pt-1">
                      <span className="text-primary text-base font-bold tracking-tight sm:text-lg">
                        {formatMoney(p.price)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Begin Your Beauty Journey?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-on-primary">
            {t("home.ctaSubtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate({ name:"booking" })}
              className="btn-press w-full bg-white text-primary hover:bg-blush sm:w-auto"
            >
              <Calendar className="mr-2 h-5 w-5" />
              {t("nav.bookNow")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ name:"contact" })}
              className="press-feedback w-full border-white bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <Phone className="mr-2 h-4 w-4" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
