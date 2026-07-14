"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { apiPost } from "@/lib/api-client"
import { useLang } from "@/store/lang"
import { CLINIC_PHONE, CLINIC_EMAIL, CLINIC_ADDRESS, CLINIC_HOURS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MapPin, Clock, Send, Loader2, MessageCircle } from "lucide-react"
import { toast } from "sonner"

export function ContactPage() {
  const t = useLang((s) => s.t)
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 bg-rose-100 text-rose-700">
          <MessageCircle className="me-1.5 h-3 w-3" />
          {t("contact.badge")}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">{t("contact.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {t("contact.subtitle")}
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Contact info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                <Phone className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <div className="text-sm font-semibold">{t("contact.phone")}</div>
                <div className="text-sm text-muted-foreground">{CLINIC_PHONE}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                <Mail className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <div className="text-sm font-semibold">{t("contact.email")}</div>
                <div className="text-sm text-muted-foreground">{CLINIC_EMAIL}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                <MapPin className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <div className="text-sm font-semibold">{t("contact.address")}</div>
                <div className="text-sm text-muted-foreground">{CLINIC_ADDRESS}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                <Clock className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <div className="text-sm font-semibold">{t("contact.hours")}</div>
                <div className="text-sm text-muted-foreground">{CLINIC_HOURS}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("contact.sendMessage")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("contact.name")} <span className="text-rose-500">{t("contact.required")}</span></Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("contact.namePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("contact.phone")}</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t("contact.message")} <span className="text-rose-500">{t("contact.required")}</span></Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t("contact.messagePlaceholder")}
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
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

      {/* Map placeholder */}
      <Card className="mt-8 overflow-hidden">
        <div className="relative h-64 bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-rose-500" />
              <div className="mt-2 font-medium">{CLINIC_ADDRESS}</div>
              <div className="text-sm text-muted-foreground">{t("contact.cityState")}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
