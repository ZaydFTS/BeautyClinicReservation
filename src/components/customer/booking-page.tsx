"use client"

import { useQuery, useMutation } from"@tanstack/react-query"
import { useNav, type Route } from"@/store/nav"
import { useLang } from"@/store/lang"
import { apiGet, apiPost } from"@/lib/api-client"
import { formatMoney, formatTime, formatDateTime, toISODate, addDays, sameDay } from"@/lib/format"
import { Button } from"@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import { Textarea } from"@/components/ui/textarea"
import { Badge } from"@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from"@/components/ui/select"
import { toast } from"sonner"
import {
  Calendar, Clock, ChevronLeft, ChevronRight, Check, Loader2,
  CalendarDays, User, Phone, Mail, Sparkles, ArrowRight,
} from"lucide-react"
import { useState, useMemo, useRef, useEffect } from"react"

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  durationMin: number
  category: string
}

interface Slot {
  id: string
  serviceId: string
  startTime: string
  endTime: string
  status: string
  note: string | null
  service?: Service
}

interface BookingPayload {
  slotId: string
  customerName: string
  phone: string
  email?: string
  note?: string
}

export function BookingPage({ route }: { route: Extract<Route, { name:"booking" }> }) {
  const navigate = useNav((s) => s.navigate)
  const t = useLang((s) => s.t)
  const lang = useLang((s) => s.lang)
  const locale = lang ==="ar" ?"ar" :"en-US"
  const initialServiceId = route.serviceId

  const [selectedService, setSelectedService] = useState<string>(initialServiceId ||"")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlotId, setSelectedSlotId] = useState<string>("")
  const [form, setForm] = useState({
    customerName:"",
    phone:"",
    email:"",
    note:"",
  })

  // Refs for auto-scroll between steps
  const step2Ref = useRef<HTMLDivElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)

  // Fetch services
  const { data: servicesData } = useQuery({
    queryKey: ["services","active"],
    queryFn: () => apiGet<{ services: Service[] }>("/api/services?active=true"),
  })
  const services = servicesData?.services || []
  const currentService = services.find((s) => s.id === selectedService)

  // Fetch slots for selected date + service
  const dateStr = toISODate(selectedDate)
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["slots", selectedService, dateStr],
    queryFn: () =>
      apiGet<{ slots: Slot[] }>(
        `/api/slots?date=${dateStr}${selectedService ? `&serviceId=${selectedService}` :""}`
      ),
    enabled: !!selectedService,
  })

  const slots = slotsData?.slots || []
  // Group slots by hour buckets for nicer display
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
    onSuccess: (data) => {
      toast.success(t("booking.successToast"))
      navigate({ name:"home" })
      // Reset
      setSelectedSlotId("")
      setForm({ customerName:"", phone:"", email:"", note:"" })
    },
    onError: (err: Error) => {
      toast.error(err.message ||"Failed to book appointment")
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

  // Auto-scroll to step 2 when step 1 is completed
  const prevStep1 = useRef<boolean>(step1Complete)
  useEffect(() => {
    if (step1Complete && !prevStep1.current) {
      // small delay to let slots section render
      setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior:"smooth", block:"start" })
      }, 120)
    }
    prevStep1.current = step1Complete
  }, [step1Complete])

  // Auto-scroll to step 3 when step 2 is completed
  const prevStep2 = useRef<boolean>(step2Complete)
  useEffect(() => {
    if (step2Complete && !prevStep2.current) {
      setTimeout(() => {
        step3Ref.current?.scrollIntoView({ behavior:"smooth", block:"start" })
      }, 120)
    }
    prevStep2.current = step2Complete
  }, [step2Complete])

  const selectedSlot = slots.find((s) => s.id === selectedSlotId)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 bg-blush text-secondary">
          <Calendar className="me-1.5 h-3 w-3" />
          {t("booking.badge")}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">{t("booking.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {t("booking.subtitle")}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left: 3 numbered step cards */}
        <div className="space-y-6 lg:col-span-2 min-w-0">
          {/* Step 1: Choose Your Service */}
          <Card className="relative overflow-hidden rounded-2xl border-outline-variant/70">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${step1Complete ? "bg-primary text-white" : "bg-blush text-secondary"}`}>
                  {step1Complete ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <div>
                  <CardTitle className="text-lg">{t("booking.step1Service")}</CardTitle>
                  <CardDescription className="mt-0.5">
                    Pick the treatment you&apos;d like to book
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedService}
                onValueChange={(v) => {
                  setSelectedService(v)
                  setSelectedSlotId("")
                }}
              >
                <SelectTrigger className="w-full border-outline-variant bg-card focus:border-primary">
                  <SelectValue placeholder={t("booking.selectService")} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="font-medium">{s.name}</span>
                      <span className="ms-2 text-xs text-muted-foreground">
                        · {formatMoney(s.price)} · {s.durationMin}m
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentService && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-blush px-2 py-2.5 text-center">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("booking.price")}</div>
                    <div className="mt-0.5 text-base font-bold text-primary">
                      {formatMoney(currentService.price)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-blush px-2 py-2.5 text-center">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("booking.duration")}</div>
                    <div className="mt-0.5 text-base font-bold text-primary">
                      {currentService.durationMin}m
                    </div>
                  </div>
                  <div className="rounded-lg bg-blush px-2 py-2.5 text-center">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("booking.category")}</div>
                    <div className="mt-0.5 text-base font-bold text-primary">
                      {currentService.category}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Select Date & Time */}
          <Card ref={step2Ref as any} className={`relative overflow-hidden rounded-2xl transition-all ${step1Complete ? "border-outline-variant/70" : "border-dashed border-outline-variant/50 opacity-60"}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${step2Complete ? "bg-primary text-white" : step1Complete ? "bg-blush text-secondary" : "bg-muted text-muted-foreground"}`}>
                  {step2Complete ? <Check className="h-4 w-4" /> : "2"}
                </div>
                <div>
                  <CardTitle className="text-lg">{t("booking.step2DateTime")}</CardTitle>
                  <CardDescription className="mt-0.5">
                    {t("booking.step2Desc")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Date picker */}
              <div className="flex items-center justify-between gap-2 rounded-lg border border-outline-variant bg-card p-3">
                <Button variant="ghost" size="icon" onClick={goPrevDay} disabled={selectedDate <= today} className="press-feedback hover:bg-blush">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-sm font-semibold">
                    {selectedDate.toLocaleDateString(locale, {
                      weekday:"long",
                      month:"long",
                      day:"numeric",
                      year:"numeric",
                    })}
                  </div>
                  {sameDay(selectedDate, new Date()) && (
                    <div className="text-xs text-primary">{t("booking.today")}</div>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={goNextDay} className="press-feedback hover:bg-blush">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick date chips */}
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = addDays(today, i)
                  const isSelected = sameDay(d, selectedDate)
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(d)}
                      className={`press-feedback flex-shrink-0 flex min-w-14 sm:min-w-16 flex-col items-center rounded-lg border p-2 transition ${
                        isSelected
                          ? "border-primary bg-blush text-secondary"
                          : "border-border bg-card hover:border-primary hover:bg-blush"
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider">
                        {d.toLocaleDateString(locale, { weekday:"short" })}
                      </span>
                      <span className="text-lg font-bold">{d.getDate()}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {d.toLocaleDateString(locale, { month:"short" })}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Slots */}
              {!selectedService ? (
                <div className="mt-6 relative overflow-hidden rounded-2xl border border-dashed border-outline-variant/70 bg-blush p-6 text-center">
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
                <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-12 shimmer rounded-lg" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="mt-6 relative overflow-hidden rounded-2xl border border-dashed border-outline-variant/70 bg-blush p-6 text-center">
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
                <div className="mt-6 space-y-4">
                  {Array.from(slotsByService.entries()).map(([sid, slotList]) => {
                    const svc = slotList[0]?.service
                    return (
                      <div key={sid}>
                        {svc && (
                          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {svc.name}
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {slotList.map((slot) => {
                            const isBooked = (slot as any).appointments && (slot as any).appointments.length > 0
                            const isAvailable = slot.status ==="AVAILABLE" && !isBooked
                            const isSelected = slot.id === selectedSlotId
                            return (
                              <button
                                key={slot.id}
                                onClick={() => isAvailable && setSelectedSlotId(slot.id)}
                                disabled={!isAvailable}
                                className={`press-feedback relative flex min-h-[44px] flex-col items-center justify-center rounded-lg border-2 p-2 transition-all ${
                                  isSelected
                                    ? "border-primary bg-primary text-white"
                                    : isAvailable
                                    ? "border-border bg-card hover:border-primary hover:bg-blush"
                                    : "cursor-not-allowed border-border bg-muted opacity-40"
                                }`}
                              >
                                <span className="text-sm font-semibold">
                                  {formatTime(slot.startTime)}
                                </span>
                                {isSelected && (
                                  <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white p-0.5 text-primary shadow" />
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

          {/* Step 3: Your Details */}
          <Card ref={step3Ref as any} className={`relative overflow-hidden rounded-2xl transition-all ${step2Complete ? "border-outline-variant/70" : "border-dashed border-outline-variant/50 opacity-60"}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${step3Complete ? "bg-primary text-white" : step2Complete ? "bg-blush text-secondary" : "bg-muted text-muted-foreground"}`}>
                  {step3Complete ? <Check className="h-4 w-4" /> : "3"}
                </div>
                <div>
                  <CardTitle className="text-lg">{t("booking.step3Details")}</CardTitle>
                  <CardDescription className="mt-0.5">
                    Tell us who we&apos;re pampering
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {t("booking.fullName")} <span className="text-primary">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Jane Doe"
                  className="border-outline-variant focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {t("booking.phone")} <span className="text-primary">*</span>
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="border-outline-variant focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {t("booking.emailOptional")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                  className="border-outline-variant focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">{t("booking.notesOptional")}</Label>
                <Textarea
                  id="note"
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder={t("booking.notesPlaceholder")}
                  className="border-outline-variant focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: sticky "Your Journey" summary card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden rounded-2xl border-outline-variant bg-blush">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-1.5 text-lg">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Your Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {/* Service row */}
                <div className="rounded-lg bg-white/70 p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {t("booking.service")}
                  </div>
                  {currentService ? (
                    <div className="mt-1 flex items-start justify-between gap-2">
                      <span className="font-semibold text-foreground">{currentService.name}</span>
                      <span className="font-bold text-primary">{formatMoney(currentService.price)}</span>
                    </div>
                  ) : (
                    <div className="mt-1 text-muted-foreground">—</div>
                  )}
                  {currentService && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-secondary">
                      <Clock className="h-3 w-3" />
                      {currentService.durationMin} {t("nav.treatmentDuration")}
                    </div>
                  )}
                </div>

                {/* Date row */}
                <div className="rounded-lg bg-white/70 p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {t("common.date")}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 font-semibold text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-secondary" />
                    {selectedDate.toLocaleDateString(locale, { weekday:"short", month:"short", day:"numeric" })}
                  </div>
                </div>

                {/* Time row */}
                <div className="rounded-lg bg-white/70 p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {t("common.time")}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 font-semibold text-foreground">
                    <Clock className="h-3.5 w-3.5 text-secondary" />
                    {selectedSlot ? formatTime(selectedSlot.startTime) : "—"}
                  </div>
                </div>

                {/* Total */}
                {currentService && (
                  <div className="flex items-center justify-between border-t border-outline-variant pt-3">
                    <span className="font-semibold text-foreground">{t("common.total")}</span>
                    <span className="font-bold text-primary text-lg">{formatMoney(currentService.price)}</span>
                  </div>
                )}

                <div className="rounded-md bg-white/60 p-2 text-xs text-muted-foreground">
                  {t("booking.payInClinic")}
                </div>

                <Button
                  size="lg"
                  className="btn-press mt-1 w-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
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
                    </>
                  )}
                </Button>

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
  )
}
