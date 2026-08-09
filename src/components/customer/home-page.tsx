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
 {/* Hero */}
 <section className="hero-gradient relative overflow-hidden">
 {/* Floating decorative blobs */}
 <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
 <div className="pointer-events-none absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />

 <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
 <div className="mx-auto max-w-3xl text-center">
 <Badge variant="secondary" className="mb-6 animate-fade-in-up bg-blush text-secondary hover:bg-blush">
 <Sparkles className="mr-1.5 h-3 w-3" />
 {t("home.badge")}
 </Badge>
 <h1 className="animate-fade-in-up text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl" style={{ animationDelay:"0.05s" }}>
 {t("home.heroTitle1")}
 <span className="text-primary">
 {""}{t("home.heroTitle2")}
 </span>
 </h1>
 <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-balance text-lg text-muted-foreground" style={{ animationDelay:"0.1s" }}>
 {t("home.heroSubtitle")}
 </p>
 <div className="mt-10 flex animate-fade-in-up flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay:"0.15s" }}>
 <Button
 size="lg"
 onClick={() => navigate({ name:"booking" })}
 className="btn-shimmer pulse-glow w-full bg-primary"
 >
 <Calendar className="mr-2 h-5 w-5" />
 {t("nav.bookAppointment")}
 </Button>
 <Button
 size="lg"
 variant="outline"
 onClick={() => navigate({ name:"services" })}
 className="w-full border-outline-variant hover:border-outline hover:bg-blush sm:w-auto"
 >
 {t("home.exploreServices")}
 <ArrowRight className="ml-2 h-4 w-4" />
 </Button>
 </div>
 <div className="mt-8 flex animate-fade-in-up items-center justify-center gap-1 text-sm text-muted-foreground" style={{ animationDelay:"0.2s" }}>
 {[1, 2, 3, 4, 5].map((i) => (
 <Star key={i} className="h-4 w-4 fill-primary text-primary" />
 ))}
 <span className="ml-2 font-medium text-foreground">{t("home.rating")}</span>
 <span>· {t("home.happyClients")}</span>
 </div>
 </div>
 </div>
 </section>

 {/* Trust badges */}
 <section className="border-y border-border/60 bg-card">
 <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
 {[
 { icon: ShieldCheck, title: t("home.trust1Title"), desc: t("home.trust1Desc") },
 { icon: Award, title: t("home.trust2Title"), desc: t("home.trust2Desc") },
 { icon: Clock, title: t("home.trust3Title"), desc: CLINIC_HOURS.split("·")[0] },
 { icon: Heart, title: t("home.trust4Title"), desc: t("home.trust4Desc") },
 ].map((item, i) => (
 <div
 key={item.title}
 className="card-hover flex items-start gap-3 rounded-lg p-2"
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
 <Button variant="ghost" onClick={() => navigate({ name:"services" })} className="hidden sm:inline-flex">
 {t("home.viewAll")}
 <ChevronRight className="ml-1 h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" onClick={() => navigate({ name:"services" })} className="sm:hidden" aria-label={t("home.viewAll")}>
 <ChevronRight className="h-5 w-5" />
 </Button>
 </div>

 <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {services.length === 0 ? (
 Array.from({ length: 6 }).map((_, i) => (
 <Card key={i} className="overflow-hidden">
 <div className="h-32 shimmer" />
 <CardContent className="p-4">
 <div className="h-4 w-2/3 shimmer rounded" />
 <div className="mt-2 h-3 w-full shimmer rounded" />
 <div className="mt-2 h-3 w-1/2 shimmer rounded" />
 </CardContent>
 </Card>
 ))
 ) : (
 services.map((svc, i) => (
 <Card
 key={svc.id}
 className="card-lift group animate-fade-in-up relative cursor-pointer gap-0 overflow-hidden rounded-2xl border-outline-variant/70 py-0 shadow-sm hover:border-outline-variant hover:shadow-xl hover:shadow-primary/10"
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
 <div className="pointer-events-none absolute inset-0 bg-black/40" />
 </div>
 )}
 <CardHeader className={`relative overflow-hidden p-5 ${svc.imageUrl ?"" :"bg-blush"}`}>
 {/* Decorative orb - only when no image */}
 {!svc.imageUrl && (
 <>
 <div
 className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/15"
 aria-hidden
 />
 <Sparkles
 className="pointer-events-none absolute right-4 top-4 h-5 w-5 text-primary/40 transition-colors group-hover:text-primary/70"
 aria-hidden
 />
 </>
 )}
 <div className="relative flex items-start justify-between gap-2">
 <Badge
 variant="outline"
 className="border-white/60 bg-white/70 px-2.5 py-1 text-xs font-medium text-secondary shadow-sm backdrop-blur-md"
 >
 {svc.category}
 </Badge>
 <div className="text-right">
 <div className="text-primary text-lg font-bold tracking-tight">
 {formatMoney(svc.price)}
 </div>
 <div className="mt-0.5 flex items-center justify-end gap-0.5 text-xs text-secondary/70">
 <Clock className="h-3 w-3" />
 {svc.durationMin} {t("nav.treatmentDuration")}
 </div>
 </div>
 </div>
 </CardHeader>
 <CardContent className="p-5">
 <CardTitle className="text-base font-semibold tracking-tight transition-colors group-hover:text-secondary">
 {svc.name}
 </CardTitle>
 {svc.description && (
 <CardDescription className="mt-1.5 line-clamp-2 leading-relaxed">
 {svc.description}
 </CardDescription>
 )}
 </CardContent>
 <CardFooter className="p-5 pt-0">
 <Button
 size="sm"
 variant="outline"
 className="press-feedback w-full border-outline-variant/70 transition-all duration-300 group-hover:border-primary group-hover:bg-primary"
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
 ))
 )}
 </div>
 </section>

 {/* Shop preview */}
 <section className="bg-blush">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex items-end justify-between">
 <div>
 <Badge variant="secondary" className="mb-2 bg-blush text-secondary">
 <ShoppingBag className="mr-1 h-3 w-3" />
 Shop
 </Badge>
 <h2 className="text-3xl font-bold tracking-tight">{t("home.aftercareTitle")}</h2>
 <p className="mt-2 text-muted-foreground">
 Professional-grade products to extend your results at home.
 </p>
 </div>
 <Button variant="ghost" onClick={() => navigate({ name:"shop" })} className="hidden sm:inline-flex">
 {t("home.shopAll")}
 <ChevronRight className="ml-1 h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" onClick={() => navigate({ name:"shop" })} className="sm:hidden" aria-label={t("home.shopAll")}>
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
 className="card-lift group animate-fade-in-up relative cursor-pointer overflow-hidden rounded-2xl border-outline-variant/70 py-0 shadow-sm hover:border-outline-variant hover:shadow-xl hover:shadow-primary/10"
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
 {/* Subtle bottom gradient for depth */}
 <div
 className="pointer-events-none absolute inset-0 bg-black/5"
 aria-hidden
 />

 {/* Low-stock badge */}
 {p.stock <= 5 && p.stock > 0 && (
 <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-primary/15">
 <span className="h-1 w-1 rounded-full bg-primary" />
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
 {t("home.ctaTitle")}
 </h2>
 <p className="mt-4 text-lg text-on-primary">
 {t("home.ctaSubtitle")}
 </p>
 <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
 <Button
 size="lg"
 variant="secondary"
 onClick={() => navigate({ name:"booking" })}
 className="w-full bg-white text-primary hover:bg-blush sm:w-auto"
 >
 <Calendar className="mr-2 h-5 w-5" />
 {t("nav.bookNow")}
 </Button>
 <Button
 size="lg"
 variant="outline"
 onClick={() => navigate({ name:"contact" })}
 className="w-full border-white bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
 >
 <Phone className="mr-2 h-4 w-4" />
 {t("home.talkToUs")}
 </Button>
 </div>
 </div>
 </section>
 </div>
 )
}
