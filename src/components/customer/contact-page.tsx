"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { apiPost } from "@/lib/api-client"
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
      toast.success("Message sent! We'll get back to you shortly.")
      setForm({ name: "", email: "", phone: "", message: "" })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to send message")
    },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 bg-rose-100 text-rose-700">
          <MessageCircle className="mr-1.5 h-3 w-3" />
          Get in touch
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Have a question about our treatments, products, or booking? Send us a message and
          we'll respond within one business day.
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
                <div className="text-sm font-semibold">Phone</div>
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
                <div className="text-sm font-semibold">Email</div>
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
                <div className="text-sm font-semibold">Address</div>
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
                <div className="text-sm font-semibold">Hours</div>
                <div className="text-sm text-muted-foreground">{CLINIC_HOURS}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we help you?"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !form.name || !form.message}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
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
              <div className="text-sm text-muted-foreground">Beverly Hills, California</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
