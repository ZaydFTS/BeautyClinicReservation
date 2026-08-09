"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { useNav, type Route } from "@/store/nav"
import { useLang } from "@/store/lang"
import { apiGet, apiPost } from "@/lib/api-client"
import { formatMoney, formatTime, toISODate, addDays, sameDay } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Calendar, Clock, ChevronLeft, ChevronRight, Check, Loader2,
  CalendarDays, User, Phone, Mail, Sparkles, ArrowRight, HandHeart,
} from "lucide-react"
import { useState, useMemo, useRef, useEffect } from "react"
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
  imageUrl: string | null
}

interface Slot {
  id: string
  serviceId: string
  startTime: string
  endTime: string
  status: string
  note: string | null
  service?: Service
  appointments?: { id: string }[]
}

interface BookingPayload {
  slotId: string
  customerName: string
  phone: string
  email?: string
  note?: string
}

export function BookingPage({ route }: { route: Extract<Route, { name: "booking" }> }) {
  const navigate = useNav((s) => s.navigate)
  const t = useLang((s) => s.t)
  const lang = useLang((s) => s.lang)
  const locale = lang === "ar" ? "ar" : "en-US"
  const initialServiceId = route.serviceId

  const [selectedService, setSelectedService] = useState<string>(initialServiceId || "")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlotId, setSelectedSlotId] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    note: "",
  })

  // Refs for auto-scroll between steps
  const step2Ref = useRef<HTMLDivElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)

  // Fetch services
  const { data: servicesData } = useQuery({
    queryKey: ["services", "active"],
    queryFn: () => apiGet<{ services: Service[] }>("/api/services?active=true"),
  })
  const services = servicesData?.services || []
  const currentService = services.find((s) => s.id === selectedService)

  // Categories derived from services
  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map((s) => s.category)))
    return ["All", ...cats]
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
  }, [services])

  const filteredServices = activeCategory === "All" ? services : services.filter((s) => s.category === activeCategory)

  // Fetch slots for selected date + service
  const dateStr = toISODate(selectedDate)
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["slots", selectedService, dateStr],
    queryFn: () =>
      apiGet<{ slots: Slot[] }>(
        `/api/slots?date=${dateStr}${selectedService ? `&serviceId=${selectedService}` : ""}`
      ),
    enabled: !!selectedService,
  })

  const slots = slotsData?.slots || []
  const slotsByService = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const slot of slots) {
      const key = slot.serviceId
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(slot)
    }
    return map
  }, [slots])

  const bookingMutation = useMutation({
    mutationFn: (payload: BookingPayload) =>
      apiPost<{ appointment: { id: string } }>("/api/appointments", payload),
    onSuccess: () => {
      toast.success(t("booking.successToast"))
      navigate({ name: "home" })
      setSelectedSlotId("")
      setForm({ customerName: "", phone: "", email: "", note: "" })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to book appointment")
    },
  })

  const handleBook = () => {
    if (!selectedSlotId) {
      toast.error(t("booking.selectSlotToast"))
      return
    }
    if (!form.customerName || !form.phone) {
      toast.error(t("booking.fillDetailsToast"))
      return
    }
    bookingMutation.mutate({
      slotId: selectedSlotId,
      customerName: form.customerName,
      phone: form.phone,
      email: form.email || undefined,
      note: form.note || undefined,
    })
  }

  // Date navigation
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const goPrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    if (d >= today) setSelectedDate(d)
  }
  const goNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    if (d <= addDays(today, 30)) setSelectedDate(d)
  }

  // Step completion flags
  const step1Complete = !!selectedService
  const step2Complete = !!selectedSlotId
  const step3Complete = !!(form.customerName && form.phone)
  const allStepsComplete = step1Complete && step2Complete && step3Complete

  // Auto-scroll
  const prevStep1 = useRef<boolean>(step1Complete)
  useEffect(() => {
    if (step1Complete && !prevStep1.current) {
      setTimeout(() => step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120)
    }
    prevStep1.current = step1Complete
  }, [step1Complete])

  const prevStep2 = useRef<boolean>(step2Complete)
  useEffect(() => {
    if (step2Complete && !prevStep2.current) {
      setTimeout(() => step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120)
    }
    prevStep2.current = step2Complete
  }, [step2Complete])

  const selectedSlot = slots.find((s) => s.id === selectedSlotId)

  return (
    <div className="flex flex-col">
      {/* ============================================================
          PAGE HERO - R&R style with eyebrow + title
          ============================================================ */}
      <section className="relative overflow-hidden bg-blush">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-primary" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Calendar className="mr-1 inline h-3 w-3" />
                {t("booking.badge")}
              </span>
              <span className="h-px w-8 bg-primary" aria-hidden />
            </div>
            <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              {t("booking.title")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
              {t("booking.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN LAYOUT - 3 steps left + sticky "Your Journey" right
          ============================================================ */}
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: 3 numbered step sections */}
          <div className="space-y-12 lg:col-span-2 min-w-0">

            {/* ============ STEP 01: Select Treatment ============ */}
            <Reveal>
              <section ref={step2Ref as any} id="step1">
                {/* Section header with watermark number */}
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-px w-8 bg-primary" aria-hidden />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Step 01
                      </span>
                    </div>
                    <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground">
                      Select Treatment
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Pick the treatment you&apos;d like to book today
                    </p>
                  </div>
                  {step1Complete && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm shadow-primary/25">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Category filter pills */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      className={`press-feedback rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                        activeCategory === c
                          ? "bg-primary text-white shadow-sm shadow-primary/25"
                          : "border border-outline-variant text-secondary hover:border-primary hover:bg-blush hover:text-primary"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Service cards grid - 2 columns */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {filteredServices.map((svc) => {
                    const isSelected = svc.id === selectedService
                    return (
                      <button
                        key={svc.id}
                        onClick={() => {
                          setSelectedService(svc.id)
                          setSelectedSlotId("")
                        }}
                        className={`card-lift press-feedback group relative overflow-hidden rounded-2xl border-2 bg-card p-5 text-left shadow-sm transition-all ${
                          isSelected
                            ? "border-primary shadow-md shadow-primary/15"
                            : "border-outline-variant/70 hover:border-primary hover:shadow-md"
                        }`}
                      >
                        {/* Selected check badge */}
                        {isSelected && (
                          <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}

                        {/* Category + duration row */}
                        <div className="mb-2 flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-blush px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary">
                            {svc.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" />
                            {svc.durationMin} MIN
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-serif text-lg font-bold leading-snug tracking-tight text-foreground">
                          {lang === "ar" && svc.nameAr ? svc.nameAr : svc.name}
                        </h3>

                        {/* Description */}
                        {(lang === "ar" && svc.descriptionAr ? svc.descriptionAr : svc.description) && (
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {lang === "ar" && svc.descriptionAr ? svc.descriptionAr : svc.description}
                          </p>
                        )}

                        {/* Price footer */}
                        <div className="mt-4 flex items-center justify-between border-t border-outline-variant/60 pt-3">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            From
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {formatMoney(svc.price)}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            </Reveal>

            {/* ============ STEP 02: Date & Time ============ */}
            <Reveal>
              <section ref={step2Ref as any} id="step2" className={step1Complete ? "" : "opacity-50 pointer-events-none"}>
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-px w-8 bg-primary" aria-hidden />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Step 02
                      </span>
                    </div>
                    <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground">
                      Date &amp; Time
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("booking.step2Desc")}
                    </p>
                  </div>
                  {step2Complete && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm shadow-primary/25">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Calendar widget card */}
                <Card className="overflow-hidden rounded-2xl border-outline-variant/70 shadow-sm">
                  <CardContent className="p-6">
                    {/* Month navigation */}
                    <div className="mb-4 flex items-center justify-between">
                      <Button variant="ghost" size="icon" onClick={goPrevDay} disabled={selectedDate <= today} className="press-feedback h-9 w-9 hover:bg-blush">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-center">
                        <div className="font-serif text-lg font-semibold text-foreground">
                          {selectedDate.toLocaleDateString(locale, { month: "long", year: "numeric" })}
                        </div>
                        {sameDay(selectedDate, new Date()) && (
                          <div className="text-xs font-medium text-primary">{t("booking.today")}</div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={goNextDay} className="press-feedback h-9 w-9 hover:bg-blush">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quick date chips - 7 days */}
                    <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const d = addDays(today, i)
                        const isSelected = sameDay(d, selectedDate)
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedDate(d)}
                            className={`press-feedback flex-shrink-0 flex min-w-16 flex-col items-center rounded-xl border-2 p-2 transition ${
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : "border-outline-variant bg-card hover:border-primary hover:bg-blush"
                            }`}
                          >
                            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                              {d.toLocaleDateString(locale, { weekday: "short" })}
                            </span>
                            <span className="my-0.5 text-xl font-bold">{d.getDate()}</span>
                            <span className="text-[10px] opacity-70">
                              {d.toLocaleDateString(locale, { month: "short" })}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Selected date display */}
                    <div className="mb-4 rounded-lg bg-blush px-4 py-3 text-center">
                      <div className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        Selected Date
                      </div>
                      <div className="mt-0.5 font-serif text-base font-bold text-foreground">
                        {selectedDate.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })}
                      </div>
                    </div>

                    {/* Time slots */}
                    {!selectedService ? (
                      <div className="relative overflow-hidden rounded-xl border border-dashed border-outline-variant/70 bg-blush p-8 text-center">
                        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary-container/20 blur-2xl" aria-hidden />
                        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-primary/15 shadow-sm backdrop-blur-sm">
                          <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <p className="relative mt-3 text-sm font-medium">{t("booking.selectServiceFirst")}</p>
                        <p className="relative mt-1 text-xs text-muted-foreground">
                          {t("booking.selectServiceFirstDesc")}
                        </p>
                      </div>
                    ) : slotsLoading ? (
                      <div>
                        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Available Times
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-11 shimmer rounded-lg" />
                          ))}
                        </div>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="relative overflow-hidden rounded-xl border border-dashed border-outline-variant/70 bg-blush p-8 text-center">
                        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary-container/20 blur-2xl" aria-hidden />
                        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-primary/15 shadow-sm backdrop-blur-sm">
                          <CalendarDays className="h-6 w-6 text-primary" />
                        </div>
                        <p className="relative mt-3 text-sm font-medium">{t("booking.noSlotsTitle")}</p>
                        <p className="relative mt-1 text-xs text-muted-foreground">
                          {t("booking.noSlotsDesc")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Array.from(slotsByService.entries()).map(([sid, slotList]) => {
                          const svc = slotList[0]?.service
                          return (
                            <div key={sid}>
                              {svc && (
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  {lang === "ar" && svc.nameAr ? svc.nameAr : svc.name}
                                </div>
                              )}
                              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                                Available Times
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {slotList.map((slot) => {
                                  const isBooked = slot.appointments && slot.appointments.length > 0
                                  const isAvailable = slot.status === "AVAILABLE" && !isBooked
                                  const isSelected = slot.id === selectedSlotId
                                  return (
                                    <button
                                      key={slot.id}
                                      onClick={() => isAvailable && setSelectedSlotId(slot.id)}
                                      disabled={!isAvailable}
                                      className={`press-feedback relative rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                        isSelected
                                          ? "bg-primary text-white shadow-sm shadow-primary/25"
                                          : isAvailable
                                          ? "bg-blush text-secondary hover:bg-primary hover:text-white"
                                          : "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
                                      }`}
                                    >
                                      {formatTime(slot.startTime)}
                                      {isSelected && (
                                        <Check className="ml-1.5 inline h-3 w-3" />
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            </Reveal>

            {/* ============ STEP 03: Your Details ============ */}
            <Reveal>
              <section ref={step3Ref as any} id="step3" className={step2Complete ? "" : "opacity-50 pointer-events-none"}>
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-px w-8 bg-primary" aria-hidden />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Step 03
                      </span>
                    </div>
                    <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground">
                      Your Details
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tell us who we&apos;re pampering
                    </p>
                  </div>
                  {step3Complete && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm shadow-primary/25">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <Card className="overflow-hidden rounded-2xl border-outline-variant/70 shadow-sm">
                  <CardContent className="space-y-5 p-6">
                    {/* Name + Phone row */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                          <User className="h-3.5 w-3.5" />
                          {t("booking.fullName")} <span className="text-primary">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={form.customerName}
                          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                          placeholder="Jane Doe"
                          className="border-outline-variant bg-blush/50 px-4 py-3 text-base focus:border-primary focus:bg-card"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                          <Phone className="h-3.5 w-3.5" />
                          {t("booking.phone")} <span className="text-primary">*</span>
                        </Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="border-outline-variant bg-blush/50 px-4 py-3 text-base focus:border-primary focus:bg-card"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                        <Mail className="h-3.5 w-3.5" />
                        {t("booking.emailOptional")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jane@example.com"
                        className="border-outline-variant bg-blush/50 px-4 py-3 text-base focus:border-primary focus:bg-card"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="note" className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        {t("booking.notesOptional")}
                      </Label>
                      <Textarea
                        id="note"
                        rows={4}
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                        placeholder={t("booking.notesPlaceholder")}
                        className="border-outline-variant bg-blush/50 px-4 py-3 text-base focus:border-primary focus:bg-card"
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>
            </Reveal>
          </div>

          {/* ============================================================
              RIGHT: Sticky "Your Journey" summary card
              ============================================================ */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card className="overflow-hidden rounded-2xl border-outline-variant bg-blush shadow-sm">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-px w-6 bg-primary" aria-hidden />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                      Summary
                    </span>
                  </div>
                  <CardTitle className="flex items-center gap-2 font-serif text-2xl font-bold text-foreground">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Your Journey
                  </CardTitle>
                  <CardDescription className="mt-1 italic text-muted-foreground">
                    Step into a realm of clinical precision combined with holistic tranquility.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Service row */}
                  <div className="rounded-xl bg-card p-4 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Service
                    </div>
                    {currentService ? (
                      <>
                        <div className="mt-1.5 font-serif text-base font-bold text-foreground">
                          {lang === "ar" && currentService.nameAr ? currentService.nameAr : currentService.name}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-secondary">
                            <Clock className="h-3 w-3" />
                            {currentService.durationMin} min
                          </span>
                          <span className="font-bold text-primary">{formatMoney(currentService.price)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="mt-1.5 text-sm italic text-muted-foreground">Select...</div>
                    )}
                  </div>

                  {/* Date row */}
                  <div className="rounded-xl bg-card p-4 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Date
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 font-semibold text-foreground">
                      <Calendar className="h-4 w-4 text-secondary" />
                      {selectedDate.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" })}
                    </div>
                  </div>

                  {/* Time row */}
                  <div className="rounded-xl bg-card p-4 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Time
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 font-semibold text-foreground">
                      <Clock className="h-4 w-4 text-secondary" />
                      {selectedSlot ? formatTime(selectedSlot.startTime) : "Select..."}
                    </div>
                  </div>

                  {/* Total */}
                  {currentService && (
                    <div className="flex items-center justify-between border-t border-outline-variant pt-3">
                      <span className="font-semibold text-foreground">{t("common.total")}</span>
                      <span className="font-serif text-2xl font-bold text-primary">
                        {formatMoney(currentService.price)}
                      </span>
                    </div>
                  )}

                  {/* Pay in clinic note */}
                  <div className="flex items-center gap-2 rounded-lg bg-blush/60 p-2.5 text-xs text-muted-foreground">
                    <HandHeart className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    {t("booking.payInClinic")}
                  </div>

                  {/* Confirm button */}
                  <Button
                    size="lg"
                    className="btn-press mt-2 h-13 w-full rounded-full bg-primary text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    onClick={handleBook}
                    disabled={bookingMutation.isPending || !allStepsComplete}
                  >
                    {bookingMutation.isPending ? (
                      <>
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        {t("booking.booking")}
                      </>
                    ) : (
                      <>
                        <Check className="me-2 h-4 w-4" />
                        {t("booking.confirmBooking")}
                        <ArrowRight className="arrow-slide ms-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Helper text */}
                  {!allStepsComplete && (
                    <p className="text-center text-xs text-muted-foreground">
                      Complete all 3 steps to confirm
                    </p>
                  )}
                  <p className="text-center text-xs text-muted-foreground">
                    {t("booking.cancellationPolicy")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
