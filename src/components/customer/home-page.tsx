"use client"

import { useQuery } from "@tanstack/react-query"
import { useNav } from "@/store/nav"
import { apiGet } from "@/lib/api-client"
import { CLINIC_NAME, CLINIC_TAGLINE, CLINIC_HOURS } from "@/lib/constants"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles, Calendar, ShoppingBag, ShieldCheck, Clock, MapPin, Phone,
  ArrowRight, Star, Heart, Leaf, Award, ChevronRight,
} from "lucide-react"

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  durationMin: number
  category: string
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
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Floating decorative blobs */}
        <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-rose-300/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in-up bg-rose-100 text-rose-700 hover:bg-rose-100">
              <Sparkles className="mr-1.5 h-3 w-3" />
              Premium Laser & Beauty Clinic
            </Badge>
            <h1 className="animate-fade-in-up text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl" style={{ animationDelay: "0.05s" }}>
              Reveal Your Smoothest,
              <span className="text-gradient-rose">
                {" "}Most Confident Self
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-balance text-lg text-muted-foreground" style={{ animationDelay: "0.1s" }}>
              {CLINIC_TAGLINE}. Professional laser waxing, advanced skincare treatments,
              and premium aftercare products — all in one tranquil Beverly Hills studio.
            </p>
            <div className="mt-10 flex animate-fade-in-up flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "0.15s" }}>
              <Button
                size="lg"
                onClick={() => navigate({ name: "booking" })}
                className="btn-shimmer pulse-glow w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 sm:w-auto"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ name: "services" })}
                className="w-full border-rose-200 hover:border-rose-300 hover:bg-rose-50 sm:w-auto"
              >
                Explore Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-8 flex animate-fade-in-up items-center justify-center gap-1 text-sm text-muted-foreground" style={{ animationDelay: "0.2s" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 font-medium text-foreground">4.9</span>
              <span>· 2,400+ happy clients</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: ShieldCheck, title: "FDA-Approved Lasers", desc: "Safe for all skin types" },
            { icon: Award, title: "Certified Specialists", desc: "10+ years experience" },
            { icon: Clock, title: "Flexible Booking", desc: CLINIC_HOURS.split("·")[0] },
            { icon: Heart, title: "2,400+ Clients", desc: "Trusted since 2014" },
          ].map((item, i) => (
            <div
              key={item.title}
              className="card-hover flex items-start gap-3 rounded-lg p-2"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-rose-50 ring-1 ring-rose-100">
                <item.icon className="h-5 w-5 text-rose-600" />
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
            <Badge variant="secondary" className="mb-2 bg-rose-50 text-rose-700">
              Treatments
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Popular Treatments</h2>
            <p className="mt-2 text-muted-foreground">
              Our most-loved services, performed by certified specialists.
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate({ name: "services" })} className="hidden sm:inline-flex">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
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
                className="card-hover group cursor-pointer overflow-hidden border-rose-100/40"
                onClick={() => navigate({ name: "service_detail", serviceId: svc.id })}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <CardHeader className="relative bg-gradient-to-br from-rose-100 to-rose-50 p-4">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="bg-white/80 text-rose-700 backdrop-blur-sm">
                      {svc.category}
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-bold text-rose-600">{formatMoney(svc.price)}</div>
                      <div className="flex items-center justify-end gap-0.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {svc.durationMin} min
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-base transition-colors group-hover:text-rose-700">
                    {svc.name}
                  </CardTitle>
                  {svc.description && (
                    <CardDescription className="mt-1 line-clamp-2">
                      {svc.description}
                    </CardDescription>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full group-hover:border-rose-300 group-hover:bg-rose-50 group-hover:text-rose-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate({ name: "booking", serviceId: svc.id })
                    }}
                  >
                    Book this treatment
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Shop preview */}
      <section className="bg-gradient-to-b from-rose-50/50 to-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <Badge variant="secondary" className="mb-2 bg-rose-100 text-rose-700">
                <ShoppingBag className="mr-1 h-3 w-3" />
                Shop
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Aftercare & Beauty Essentials</h2>
              <p className="mt-2 text-muted-foreground">
                Professional-grade products to extend your results at home.
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate({ name: "shop" })} className="hidden sm:inline-flex">
              Shop all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <div className="aspect-square shimmer" />
                  <CardContent className="p-3">
                    <div className="h-3 w-2/3 shimmer rounded" />
                    <div className="mt-2 h-4 w-1/3 shimmer rounded" />
                  </CardContent>
                </Card>
              ))
            ) : (
              products.map((p) => (
                <Card
                  key={p.id}
                  className="group cursor-pointer overflow-hidden transition hover:shadow-md"
                  onClick={() => navigate({ name: "product_detail", productId: p.id })}
                >
                  <div className="aspect-square overflow-hidden bg-rose-50">
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
                  </div>
                  <CardContent className="p-3">
                    <div className="line-clamp-2 text-sm font-medium">{p.name}</div>
                    <div className="mt-2 text-base font-bold text-rose-600">
                      {formatMoney(p.price)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-rose-500 to-rose-700 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to glow?
          </h2>
          <p className="mt-4 text-lg text-rose-100">
            Book your appointment online in under 60 seconds. Available time slots shown in real-time.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate({ name: "booking" })}
              className="w-full bg-white text-rose-600 hover:bg-rose-50 sm:w-auto"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ name: "contact" })}
              className="w-full border-white text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <Phone className="mr-2 h-4 w-4" />
              Talk to us
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
