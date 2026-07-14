"use client"

import { useQuery } from "@tanstack/react-query"
import { useNav, type Route } from "@/store/nav"
import { useLang } from "@/store/lang"
import { apiGet } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ChevronLeft, Check, ShieldCheck, Sparkles, HelpCircle } from "lucide-react"

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
  const t = useLang((s) => s.t)
  const { data, isLoading } = useQuery({
    queryKey: ["service", route.serviceId],
    queryFn: () => apiGet<{ service: Service }>(`/api/services/${route.serviceId}`),
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square shimmer rounded-2xl" />
          <div className="space-y-4">
            <div className="h-5 w-1/4 shimmer rounded-full" />
            <div className="h-8 w-2/3 shimmer rounded" />
            <div className="h-8 w-1/3 shimmer rounded" />
            <div className="h-24 w-full shimmer rounded-lg" />
            <div className="h-10 w-full shimmer rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  const svc = data?.service
  if (!svc) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-200/60 to-amber-200/40 blur-xl" aria-hidden />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-rose-50 ring-1 ring-rose-200/60">
            <HelpCircle className="h-9 w-9 text-rose-500" />
          </div>
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight">{t("serviceDetail.notFound")}</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          {t("serviceDetail.notFoundDesc")}
        </p>
        <Button
          className="btn-shimmer mt-6 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
          onClick={() => navigate({ name: "services" })}
        >
          <ChevronLeft className="me-2 h-4 w-4" />
          {t("serviceDetail.backToServices")}
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
        <ChevronLeft className="me-1 h-4 w-4" />
        {t("serviceDetail.allServices")}
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: hero image / illustration */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-100/70 bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50 p-8 shadow-sm">
          {/* Layered decorative orbs */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-rose-300/50 to-amber-200/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-gradient-to-br from-rose-200/40 to-amber-100/30 blur-3xl"
            aria-hidden
          />
          {/* Sparkles accents */}
          <Sparkles className="pointer-events-none absolute right-6 top-6 h-16 w-16 text-rose-300/50" aria-hidden />
          <Sparkles className="pointer-events-none absolute bottom-8 left-6 h-10 w-10 text-amber-300/60" aria-hidden />
          {/* Subtle dot pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, oklch(0.5 0.2 350) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
            aria-hidden
          />

          <div className="relative flex h-full min-h-[280px] flex-col items-center justify-center text-center">
            <Badge
              variant="outline"
              className="mb-4 border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-rose-700 shadow-sm backdrop-blur-md"
            >
              {svc.category}
            </Badge>
            <h2 className="text-balance text-2xl font-bold tracking-tight">{svc.name}</h2>
            <div className="text-gradient-rose mt-4 text-5xl font-bold tracking-tight">
              {formatMoney(svc.price)}
            </div>
            <div className="mt-3 flex items-center gap-1.5 rounded-full border border-rose-200/60 bg-white/60 px-3 py-1 text-xs font-medium text-rose-700 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5" />
              {svc.durationMin} {t("serviceDetail.minutes")}
            </div>
          </div>
        </div>

        {/* Right: details + CTA */}
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t("serviceDetail.aboutTreatment")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {svc.description && (
                <p className="text-sm text-muted-foreground">{svc.description}</p>
              )}
              <div className="space-y-2 border-t pt-4">
                {[
                  t("serviceDetail.performedBy"),
                  t("serviceDetail.fdaApproved"),
                  t("serviceDetail.personalized"),
                  t("serviceDetail.aftercare"),
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
                  <strong className="text-rose-700">{t("serviceDetail.bookingEasy")}</strong>{" "}
                  {t("serviceDetail.bookingEasyDesc")}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="mt-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
            onClick={() => navigate({ name: "booking", serviceId: svc.id })}
          >
            <Calendar className="me-2 h-5 w-5" />
            {t("serviceDetail.bookThisTreatment")}
          </Button>
        </div>
      </div>
    </div>
  )
}
