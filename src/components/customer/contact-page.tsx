"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { apiPost } from "@/lib/api-client"
import { useLang } from "@/store/lang"
import { useNav } from "@/store/nav"
import { CLINIC_PHONE, CLINIC_EMAIL, CLINIC_ADDRESS, CLINIC_HOURS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Phone, Mail, MapPin, Clock, Send, Loader2, MessageCircle, ArrowRight,
  Sparkles, Flower, ClipboardCheck, ShieldCheck, HandHeart, Star,
} from "lucide-react"
import { toast } from "sonner"
import { Reveal } from "@/components/shared/reveal"

export function ContactPage() {
  const t = useLang((s) => s.t)
  const navigate = useNav((s) => s.navigate)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
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
      setForm({ name: "", email: "", phone: "", message: "" })
    },
    onError: (err: Error) => {
      toast.error(err.message || t("contact.failedToast"))
    },
  })

  return (
    <div className="flex flex-col">
      {/* ============================================================
          PAGE HERO - R&R style centered with eyebrow
          ============================================================ */}
      <section className="relative overflow-hidden bg-blush">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-primary" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <MessageCircle className="mr-1 inline h-3 w-3" />
              {t("contact.badge")}
            </span>
            <span className="h-px w-8 bg-primary" aria-hidden />
          </div>
          <h1 className="text-balance font-serif text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Crafting Confidence.{" "}
            <span className="italic text-primary">Enhancing Radiance.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
            At {`Glow & Smooth`}, we blend clinical precision with the luxuriousness of a premium spa.
            Our mission is to elevate your natural beauty in a space designed for total relaxation and profound renewal.
          </p>
        </div>
      </section>

      {/* ============================================================
          PHILOSOPHY SECTION - "Science Meets Serenity"
          Two-column: text + feature cards left, image grid right
          ============================================================ */}
      <section className="bg-surface overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left - text + feature cards */}
            <Reveal>
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-px w-8 bg-primary" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Our Philosophy
                  </span>
                </div>
                <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Science Meets <span className="italic text-primary">Serenity</span>
                </h2>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                  Every treatment at our clinic is a careful orchestration of medical-grade technology and
                  time-honored relaxation rituals. We believe true beauty emerges when advanced science
                  meets a calming, restorative environment — and that&apos;s exactly what we&apos;ve created.
                </p>

                {/* Feature cards */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="card-lift rounded-2xl border border-outline-variant/60 bg-card p-5 shadow-sm">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blush">
                      <Flower className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-bold tracking-tight text-foreground">
                      Premium Care
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      Bespoke treatment tailored to your unique skin profile.
                    </p>
                  </div>
                  <div className="card-lift rounded-2xl border border-outline-variant/60 bg-card p-5 shadow-sm">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blush">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-bold tracking-tight text-foreground">
                      Clinical Efficacy
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      FDA-approved technology guided by expert hands.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right - image grid with floating badge */}
            <Reveal delay={150}>
              <div className="relative mx-auto max-w-md">
                {/* Background blur orbs */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-container/30 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-primary/15 blur-3xl" aria-hidden />

                {/* Main image */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-outline-variant bg-blush shadow-2xl shadow-primary/20">
                  <img
                    src="/hero/contact-facial.png"
                    alt="Luxury facial treatment at the beauty clinic"
                    className="img-zoom h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/5" aria-hidden />
                </div>

                {/* Floating badge - bottom left */}
                <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-outline-variant bg-white p-4 shadow-xl shadow-primary/15 sm:-left-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-serif text-xl font-bold text-foreground">10+ Years</div>
                    <div className="text-xs text-muted-foreground">of Experience</div>
                  </div>
                </div>

                {/* Floating rating badge - top right */}
                <div className="absolute -right-3 top-8 rounded-full bg-white px-4 py-2 shadow-lg shadow-primary/15 sm:-right-5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                    <span className="ml-1 text-xs font-bold text-foreground">5.0</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          CONTACT INFO + FORM SECTION
          Two-column: info cards left, form right
          ============================================================ */}
      <section className="bg-blush">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-5">
            {/* Left - contact info cards */}
            <Reveal className="lg:col-span-2">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-px w-8 bg-primary" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Contact Info
                  </span>
                </div>
                <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground">
                  We&apos;re Here to <span className="italic text-primary">Help</span>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Reach out with any questions about treatments, bookings, or products. Our beauty experts
                  respond within one business day.
                </p>

                {/* Info cards */}
                <div className="mt-8 space-y-4">
                  {[
                    { icon: Phone, label: t("contact.phone"), value: CLINIC_PHONE, href: `tel:${CLINIC_PHONE.replace(/[^\d+]/g, "")}` },
                    { icon: Mail, label: t("contact.email"), value: CLINIC_EMAIL, href: `mailto:${CLINIC_EMAIL}` },
                    { icon: MapPin, label: t("contact.address"), value: CLINIC_ADDRESS, href: "#" },
                    { icon: Clock, label: t("contact.hours"), value: CLINIC_HOURS, href: "#" },
                  ].map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      className="card-lift press-feedback group flex items-start gap-4 rounded-2xl border border-outline-variant/60 bg-card p-5 shadow-sm hover:border-primary hover:shadow-md hover:shadow-primary/10"
                    >
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blush transition-colors group-hover:bg-primary group-hover:text-white">
                        <item.icon className="h-5 w-5 text-primary group-hover:text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                          {item.label}
                        </div>
                        <div className="mt-1 font-medium text-foreground">{item.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Right - form */}
            <Reveal delay={150} className="lg:col-span-3">
              <Card className="overflow-hidden rounded-3xl border-outline-variant bg-card shadow-lg shadow-primary/5">
                <CardHeader className="p-6 pb-4 sm:p-8 sm:pb-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-px w-6 bg-primary" aria-hidden />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                      Send a Message
                    </span>
                  </div>
                  <CardTitle className="font-serif text-3xl font-bold tracking-tight text-foreground">
                    {t("contact.sendMessage")}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm">
                    Fill out the form below and we&apos;ll get back to you shortly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 p-6 pt-2 sm:p-8 sm:pt-2">
                  {/* Name + Phone row */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                        {t("contact.name")} <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder={t("contact.namePlaceholder")}
                        className="border-outline-variant bg-blush/50 px-4 py-3 text-base focus:border-primary focus:bg-card"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                        <Phone className="h-3.5 w-3.5" />
                        {t("contact.phone")}
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
                      {t("contact.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="border-outline-variant bg-blush/50 px-4 py-3 text-base focus:border-primary focus:bg-card"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                      {t("contact.message")} <span className="text-primary">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t("contact.messagePlaceholder")}
                      className="border-outline-variant bg-blush/50 px-4 py-3 text-base focus:border-primary focus:bg-card"
                    />
                  </div>

                  {/* Submit button */}
                  <Button
                    size="lg"
                    className="btn-press mt-2 h-13 w-full rounded-full bg-primary text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
                        <ArrowRight className="arrow-slide ms-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          ENVIRONMENT SECTION - "Step Into Sanctuary"
          Two large images side by side
          ============================================================ */}
      <section className="bg-surface overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-primary" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                The Environment
              </span>
              <span className="h-px w-8 bg-primary" aria-hidden />
            </div>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Step Into <span className="italic text-primary">Sanctuary</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              From the moment you walk through our doors, every detail is designed to calm the mind
              and restore the spirit.
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2">
            <Reveal>
              <div className="card-lift group relative aspect-[4/3] overflow-hidden rounded-3xl border border-outline-variant bg-blush shadow-lg shadow-primary/5">
                <img
                  src="/hero/contact-reception.png"
                  alt="Clinic reception area"
                  className="img-zoom h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/5" aria-hidden />
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="card-lift group relative aspect-[4/3] overflow-hidden rounded-3xl border border-outline-variant bg-blush shadow-lg shadow-primary/5">
                <img
                  src="/hero/contact-treatment-room.png"
                  alt="Luxury treatment room"
                  className="img-zoom h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/5" aria-hidden />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          COMMITMENT BAND - solid primary, full width
          ============================================================ */}
      <section className="bg-primary relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left - heading */}
            <Reveal>
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-px w-8 bg-white/60" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                    Our Pledge
                  </span>
                </div>
                <h2 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  Commitment to <span className="italic">You.</span>
                </h2>
                <p className="mt-5 text-base leading-relaxed text-white/85">
                  We hold ourselves to the highest standards of care, transparency, and innovation.
                  Your trust is the foundation of everything we do.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate({ name: "booking" })}
                  className="btn-press mt-8 rounded-full bg-white px-8 text-base font-semibold text-primary shadow-lg hover:bg-blush"
                >
                  Book Appointment
                  <ArrowRight className="arrow-slide ml-2 h-4 w-4" />
                </Button>
              </div>
            </Reveal>

            {/* Right - feature list */}
            <Reveal delay={150}>
              <div className="space-y-8">
                {[
                  {
                    num: "01",
                    label: "Transparency",
                    title: "Honest Assessments",
                    desc: "We provide realistic expectations and never recommend treatments you don't need.",
                    icon: ShieldCheck,
                  },
                  {
                    num: "02",
                    label: "Innovation",
                    title: "Advanced Modalities",
                    desc: "FDA-cleared technology and continuous training keep us at the forefront of aesthetic care.",
                    icon: Sparkles,
                  },
                  {
                    num: "03",
                    label: "Care",
                    title: "Personalized Attention",
                    desc: "Every treatment plan is tailored to your unique skin profile and beauty goals.",
                    icon: HandHeart,
                  },
                ].map((item) => (
                  <div key={item.num} className="flex items-start gap-5">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                        {item.num}. {item.label}
                      </div>
                      <h3 className="mt-1 font-serif text-xl font-bold text-white">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/80">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
