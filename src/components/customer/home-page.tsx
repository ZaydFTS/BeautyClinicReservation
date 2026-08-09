"use client"

import { useQuery } from "@tanstack/react-query"
import { useNav } from "@/store/nav"
import { useLang } from "@/store/lang"
import { apiGet } from "@/lib/api-client"
import { CLINIC_NAME, CLINIC_HOURS } from "@/lib/constants"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Reveal } from "@/components/shared/reveal"
import {
  Sparkles, Calendar, ShoppingBag, ShieldCheck, Clock, MapPin, Phone,
  ArrowRight, ArrowUpRight, Star, Heart, Leaf, Award, ChevronRight, Play,
} from "lucide-react"

interface Service {
  id: string
  name: string
  nameAr: string | null
  description: string | null
  descriptionAr: string | null
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
  const lang = useLang((s) => s.lang)

  const { data: servicesData } = useQuery({
    queryKey: ["services", "active"],
    queryFn: () => apiGet<{ services: Service[] }>("/api/services?active=true"),
  })
  const { data: productsData } = useQuery({
    queryKey: ["products", "active"],
    queryFn: () => apiGet<{ products: Product[] }>("/api/products?active=true"),
  })

  const services = (servicesData?.services || []).slice(0, 6)
  const products = (productsData?.products || []).slice(0, 4)

  return (
    <div className="flex flex-col">
      {/* ============================================================
          HERO - R&R style asymmetric two-column with real image
          ============================================================ */}
      <section className="relative overflow-hidden bg-blush">
        {/* Soft decorative blurred orbs (no gradients) */}
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left column - content */}
            <div className="animate-fade-in-up">
              {/* Eyebrow text */}
              <div className="mb-5 flex items-center gap-2">
                <span className="h-px w-8 bg-primary" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {t("home.badge")}
                </span>
              </div>

              {/* Main headline - Playfair serif, "Radiant" in primary */}
              <h1 className="text-balance font-serif text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                {t("home.heroTitle1")}{" "}
                <span className="italic text-primary">{t("home.heroTitle2")}</span>
              </h1>

              {/* Subheadline */}
              <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
                {t("home.heroSubtitle")}
              </p>

              {/* CTA row */}
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  onClick={() => navigate({ name: "booking" })}
                  className="btn-press btn-shimmer h-13 w-full rounded-full bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 sm:w-auto"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  {t("nav.bookAppointment")}
                </Button>
                <button
                  onClick={() => navigate({ name: "services" })}
                  className="press-feedback group inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-white transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </span>
                  {t("home.exploreServices")}
                </button>
              </div>

              {/* Rating row */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <div className="h-4 w-px bg-outline-variant" aria-hidden />
                <span className="text-sm font-medium text-foreground">{t("home.rating")}</span>
                <span className="text-sm text-muted-foreground">· {t("home.happyClients")}</span>
              </div>
            </div>

            {/* Right column - image card with floating stats overlay */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              <div className="relative mx-auto max-w-md">
                {/* Background blur orbs */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-container/30 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-primary/15 blur-3xl" aria-hidden />

                {/* Main image card */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-outline-variant bg-blush shadow-2xl shadow-primary/20">
                  <img
                    src="/hero/hero-spa.png"
                    alt="Elegant woman in luxury spa setting"
                    className="img-zoom h-full w-full object-cover"
                  />
                  {/* Subtle bottom overlay for depth (solid color, no gradient) */}
                  <div className="pointer-events-none absolute inset-0 bg-black/10" aria-hidden />
                </div>

                {/* Floating stats card - overlapping bottom-left */}
                <div className="absolute -bottom-6 -left-4 w-64 rounded-2xl border border-outline-variant bg-white p-4 shadow-xl shadow-primary/15 sm:-left-8">
                  <div className="flex items-center gap-3">
                    {/* Stacked avatars */}
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blush text-xs font-bold text-secondary"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-foreground">500+ Glowing Clients</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="font-semibold text-foreground">5.0</span>
                        <span>· Verified reviews</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge - top right */}
                <div className="absolute -right-3 top-6 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-primary/30 sm:-right-6">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  Premium
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST BADGES - minimal strip
          ============================================================ */}
      <section className="border-y border-outline-variant/60 bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: ShieldCheck, title: t("home.trust1Title"), desc: t("home.trust1Desc") },
            { icon: Award, title: t("home.trust2Title"), desc: t("home.trust2Desc") },
            { icon: Clock, title: t("home.trust3Title"), desc: CLINIC_HOURS.split("·")[0] },
            { icon: Heart, title: t("home.trust4Title"), desc: t("home.trust4Desc") },
          ].map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 80}
              className="card-lift flex items-start gap-3 rounded-lg p-2"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blush">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================================================
          CURATED TREATMENTS - R&R style 3-card grid
          3rd card is solid primary (featured)
          ============================================================ */}
      <section className="bg-surface mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Section header */}
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px w-8 bg-primary" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {t("home.treatments")}
              </span>
            </div>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Curated <span className="italic text-primary">Treatments</span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {t("home.popularDesc")}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate({ name: "services" })}
            className="press-feedback group hidden items-center gap-1.5 self-start text-sm font-semibold text-primary hover:bg-blush hover:text-secondary sm:inline-flex"
          >
            Explore All Services
            <ArrowRight className="arrow-slide h-4 w-4" />
          </Button>
        </Reveal>

        {/* Card grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl border-outline-variant/70">
                <div className="h-56 shimmer" />
                <CardContent className="space-y-3 p-6">
                  <div className="h-4 w-1/3 shimmer rounded" />
                  <div className="h-6 w-2/3 shimmer rounded" />
                  <div className="h-3 w-full shimmer rounded" />
                  <div className="h-3 w-4/5 shimmer rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            services.slice(0, 3).map((svc, i) => {
              const isFeatured = i === 2
              return (
                <Reveal key={svc.id} delay={i * 120}>
                  <Card
                    className={`card-lift group relative flex h-full flex-col gap-0 overflow-hidden rounded-2xl border py-0 shadow-none transition-all duration-300 ${
                      isFeatured
                        ? "border-primary bg-primary text-white"
                        : "border-outline-variant/70 bg-card hover:border-primary"
                    }`}
                    onClick={() => navigate({ name: "service_detail", serviceId: svc.id })}
                  >
                    {/* Image area */}
                    <div className={`relative aspect-[4/3] w-full overflow-hidden ${isFeatured ? "bg-primary-container" : "bg-blush"}`}>
                      {svc.imageUrl ? (
                        <img
                          src={svc.imageUrl}
                          alt={lang === "ar" && svc.nameAr ? svc.nameAr : svc.name}
                          className="img-zoom h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <img
                          src={
                            i === 0
                              ? "/hero/treatment-injectables.png"
                              : i === 1
                              ? "/hero/treatment-facial.png"
                              : "/hero/treatment-laser.png"
                          }
                          alt={lang === "ar" && svc.nameAr ? svc.nameAr : svc.name}
                          className="img-zoom h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                      {/* Badge on image */}
                      <div className="absolute left-4 top-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-sm backdrop-blur-md ${
                            isFeatured
                              ? "bg-white/20 text-white"
                              : "bg-white/85 text-secondary"
                          }`}
                        >
                          {svc.category}
                        </span>
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="flex flex-1 flex-col p-6">
                      <CardTitle
                        className={`font-serif text-xl font-bold tracking-tight ${
                          isFeatured ? "text-white" : "text-foreground"
                        }`}
                      >
                        {lang === "ar" && svc.nameAr ? svc.nameAr : svc.name}
                      </CardTitle>
                      {(lang === "ar" && svc.descriptionAr ? svc.descriptionAr : svc.description) && (
                        <CardDescription
                          className={`mt-2 line-clamp-2 text-sm leading-relaxed ${
                            isFeatured ? "text-white/80" : "text-muted-foreground"
                          }`}
                        >
                          {lang === "ar" && svc.descriptionAr ? svc.descriptionAr : svc.description}
                        </CardDescription>
                      )}

                      {/* Footer - price + arrow */}
                      <div className="mt-auto flex items-center justify-between pt-6">
                        <div>
                          <div className={`text-[10px] font-semibold uppercase tracking-wider ${isFeatured ? "text-white/70" : "text-muted-foreground"}`}>
                            From
                          </div>
                          <div className={`text-lg font-bold ${isFeatured ? "text-white" : "text-primary"}`}>
                            {formatMoney(svc.price)}
                          </div>
                        </div>
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                            isFeatured
                              ? "bg-white/20 text-white group-hover:bg-white group-hover:text-primary"
                              : "bg-blush text-primary group-hover:bg-primary group-hover:text-white"
                          }`}
                        >
                          <ArrowUpRight className="arrow-diagonal h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              )
            })
          )}
        </div>

        {/* Mobile "Explore All" button */}
        <div className="mt-8 sm:hidden">
          <Button
            variant="outline"
            onClick={() => navigate({ name: "services" })}
            className="press-feedback w-full rounded-full border-primary text-primary hover:bg-primary hover:text-white"
          >
            Explore All Services
            <ArrowRight className="arrow-slide ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ============================================================
          SHOP PREVIEW - Aftercare & Beauty Essentials
          ============================================================ */}
      <section className="bg-blush">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-px w-8 bg-primary" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  <ShoppingBag className="mr-1 inline h-3 w-3" />
                  Shop
                </span>
              </div>
              <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Aftercare <span className="italic text-primary">Essentials</span>
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Professional-grade products to extend your results at home.
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate({ name: "shop" })}
              className="press-feedback group hidden items-center gap-1.5 self-start text-sm font-semibold text-primary hover:bg-white hover:text-secondary sm:inline-flex"
            >
              {t("home.shopAll")}
              <ArrowRight className="arrow-slide h-4 w-4" />
            </Button>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
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
                <Reveal key={p.id} delay={i * 100}>
                  <Card
                    className="card-lift group relative cursor-pointer overflow-hidden rounded-2xl border-outline-variant/70 bg-card py-0 shadow-none transition-all hover:border-primary"
                    onClick={() => navigate({ name: "product_detail", productId: p.id })}
                  >
                    <div className="relative aspect-square overflow-hidden bg-blush">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="img-zoom h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Leaf className="h-14 w-14 text-primary-container/70" />
                        </div>
                      )}
                      {/* Low-stock badge */}
                      {p.stock <= 5 && p.stock > 0 && (
                        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-white/90 px-2.5 py-1 text-xs font-medium text-secondary backdrop-blur-md">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Only {p.stock} left
                        </div>
                      )}
                      {p.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                          <span className="rounded-full border border-outline-variant bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary shadow-sm">
                            Out of stock
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="space-y-2 p-4">
                      <div className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug tracking-tight transition-colors group-hover:text-secondary">
                        {p.name}
                      </div>
                      <div className="pt-1">
                        <span className="text-lg font-bold text-primary">
                          {formatMoney(p.price)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL CTA - solid primary
          ============================================================ */}
      <section className="bg-primary relative overflow-hidden">
        {/* Decorative orbs (solid colors, no gradients) */}
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" aria-hidden />

        <Reveal className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-white/60" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              {t("home.ctaTitle")}
            </span>
            <span className="h-px w-8 bg-white/60" aria-hidden />
          </div>
          <h2 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to Begin Your <span className="italic">Beauty Journey?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
            {t("home.ctaSubtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate({ name: "booking" })}
              className="btn-press h-13 w-full rounded-full bg-white px-8 text-base font-semibold text-primary shadow-lg hover:bg-blush sm:w-auto"
            >
              <Calendar className="mr-2 h-5 w-5" />
              {t("nav.bookNow")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ name: "contact" })}
              className="press-feedback h-13 w-full rounded-full border-white bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <Phone className="mr-2 h-4 w-4" />
              {t("home.talkToUs")}
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
