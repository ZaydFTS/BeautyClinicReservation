"use client"

import { useQuery } from "@tanstack/react-query"
import { useNav, type Route } from "@/store/nav"
import { apiGet } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ChevronLeft, Check, ShieldCheck, Sparkles } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  durationMin: number
  category: string
  active: boolean
}

export function ServiceDetailPage({ route }: { route: Extract<Route, { name: "service_detail" }> }) {
  const navigate = useNav((s) => s.navigate)
  const { data, isLoading } = useQuery({
    queryKey: ["service", route.serviceId],
    queryFn: () => apiGet<{ service: Service }>(`/api/services/${route.serviceId}`),
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-6 w-1/3 shimmer rounded" />
        <div className="mt-4 h-32 w-full shimmer rounded" />
      </div>
    )
  }

  const svc = data?.service
  if (!svc) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Service not found.</p>
        <Button className="mt-4" onClick={() => navigate({ name: "services" })}>
          Back to services
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ name: "services" })}
        className="mb-4"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        All services
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: hero image / illustration */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50 p-8">
          <div className="absolute inset-0 opacity-30">
            <Sparkles className="absolute right-8 top-8 h-20 w-20 text-rose-300" />
            <Sparkles className="absolute bottom-12 left-8 h-12 w-12 text-amber-300" />
          </div>
          <div className="relative flex h-full flex-col items-center justify-center text-center">
            <Badge variant="secondary" className="mb-3 bg-white/80 text-rose-700">
              {svc.category}
            </Badge>
            <h2 className="text-2xl font-bold">{svc.name}</h2>
            <div className="mt-4 text-4xl font-bold text-rose-600">
              {formatMoney(svc.price)}
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {svc.durationMin} minutes
            </div>
          </div>
        </div>

        {/* Right: details + CTA */}
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">About this treatment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {svc.description && (
                <p className="text-sm text-muted-foreground">{svc.description}</p>
              )}
              <div className="space-y-2 border-t pt-4">
                {[
                  "Performed by certified specialists",
                  "FDA-approved equipment",
                  "Personalized consultation included",
                  "Aftercare instructions provided",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 bg-rose-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                <div>
                  <strong className="text-rose-700">Booking is easy.</strong> Choose from real-time
                  available slots created by our admin. No phone tag, no back-and-forth.
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="mt-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
            onClick={() => navigate({ name: "booking", serviceId: svc.id })}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Book this treatment
          </Button>
        </div>
      </div>
    </div>
  )
}
