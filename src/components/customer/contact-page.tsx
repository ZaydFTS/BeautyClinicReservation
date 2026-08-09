"use client"

import { useState } from"react"
import { useMutation } from"@tanstack/react-query"
import { apiPost } from"@/lib/api-client"
import { useLang } from"@/store/lang"
import { CLINIC_PHONE, CLINIC_EMAIL, CLINIC_ADDRESS, CLINIC_HOURS } from"@/lib/constants"
import { Button } from"@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import { Textarea } from"@/components/ui/textarea"
import { Badge } from"@/components/ui/badge"
import { Phone, Mail, MapPin, Clock, Send, Loader2, MessageCircle, ArrowRight } from"lucide-react"
import { toast } from"sonner"

export function ContactPage() {
  const t = useLang((s) => s.t)
  const [form, setForm] = useState({
    name:"",
    email:"",
    phone:"",
    message:"",
  })

  const mutation = useMutation({
    mutationFn: () =>
      apiPost("/api/contact", {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        message: form.message,
      }),
    onSuccess: () => {
      toast.success(t("contact.messageSent"))
      setForm({ name:"", email:"", phone:"", message:"" })
    },
    onError: (err: Error) => {
      toast.error(err.message || t("contact.failedToast"))
    },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 bg-blush text-secondary">
          <MessageCircle className="me-1.5 h-3 w-3" />
          {t("contact.badge")}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">{t("contact.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {t("contact.subtitle")}
        </p>
      </div>

      {/* Main two-column layout */}
      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        {/* Left: contact info column (decorative primary strip + info cards) */}
        <div className="space-y-4 lg:col-span-2">
          {/* Decorative primary side panel */}
          <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-container/20 blur-2xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <div className="relative">
              <h2 className="font-serif text-2xl font-semibold leading-snug">
                We&apos;re Here to Help
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Reach out with any questions about treatments, bookings, or products. Our beauty experts respond within one business day.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm backdrop-blur-md">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{CLINIC_HOURS}</span>
              </div>
            </div>
          </div>

          {/* Contact info cards */}
          {[
            { icon: Phone, label: t("contact.phone"), value: CLINIC_PHONE },
            { icon: Mail, label: t("contact.email"), value: CLINIC_EMAIL },
            { icon: MapPin, label: t("contact.address"), value: CLINIC_ADDRESS },
            { icon: Clock, label: t("contact.hours"), value: CLINIC_HOURS },
          ].map((item) => (
            <Card key={item.label} className="card-lift rounded-2xl border-outline-variant/70">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blush">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-secondary">{item.label}</div>
                  <div className="text-sm font-semibold text-foreground break-words">{item.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right: form card */}
        <div className="lg:col-span-3">
          <Card className="rounded-2xl border-outline-variant">
            <CardHeader>
              <CardTitle className="text-xl">{t("contact.sendMessage")}</CardTitle>
              <CardDescription className="mt-1">
                Fill out the form below and we&apos;ll get back to you shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    {t("contact.name")} <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("contact.namePlaceholder")}
                    className="border-outline-variant focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("contact.phone")}</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="border-outline-variant focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("contact.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="border-outline-variant focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-1">
                  {t("contact.message")} <span className="text-primary">*</span>
                </Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t("contact.messagePlaceholder")}
                  className="border-outline-variant focus:border-primary"
                />
              </div>
              <Button
                className="btn-press w-full bg-primary text-white hover:bg-primary/90"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !form.name || !form.message}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t("contact.sending")}
                  </>
                ) : (
                  <>
                    <Send className="me-2 h-4 w-4" />
                    {t("contact.send")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map section */}
      <Card className="mt-8 overflow-hidden rounded-2xl border-outline-variant">
        <div className="relative h-72 bg-blush">
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary-container/20 blur-2xl" aria-hidden />
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-primary/15 blur-2xl" aria-hidden />

          {/* Subtle dotted texture overlay using SVG (no gradient utilities) */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
            aria-hidden
          >
            <defs>
              <pattern id="dot-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#d9c0cc" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg shadow-primary/20">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-3 font-serif text-lg font-semibold text-foreground">{CLINIC_ADDRESS}</div>
              <div className="mt-1 text-sm text-muted-foreground">{t("contact.cityState")}</div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CLINIC_ADDRESS)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="press-feedback mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Get Directions
                <ArrowRight className="arrow-slide h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
