"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPut } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/shared/image-upload"
import { Sparkles, Save, Loader2, Megaphone, Home, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export function AdminHomeContentPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiGet<{ settings: Record<string, string> }>("/api/site-settings"),
  })

  const raw = data?.settings || {}
  const [form, setForm] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)

  // Initialize form when data loads
  if (!loaded && data) {
    const defaults: Record<string, string> = {
      promoEnabled: "false",
      promoText: "",
      promoTextAr: "",
      promoPercent: "",
      promoLink: "#/services",
      heroTitle1: "Reveal Your Smoothest,",
      heroTitle2: "Most Confident Self",
      heroTitle1Ar: "",
      heroTitle2Ar: "",
      heroSubtitle: "",
      heroSubtitleAr: "",
      heroBadge: "Premium Laser & Beauty Clinic",
      heroBadgeAr: "",
      heroImage: "",
      ctaTitle: "Ready to Begin Your Beauty Journey?",
      ctaTitleAr: "",
      ctaSubtitle: "",
      ctaSubtitleAr: "",
    }
    setForm({ ...defaults, ...raw })
    setLoaded(true)
  }

  const updateMutation = useMutation({
    mutationFn: (settings: Record<string, string>) =>
      apiPut("/api/site-settings", { settings }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] })
      toast.success("Home page content saved")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSave = () => {
    updateMutation.mutate(form)
  }

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return <div className="h-64 shimmer rounded-lg" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-8 bg-primary" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Content
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Home Page Content
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control the promo banner and home page hero content.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="btn-press bg-primary hover:bg-primary/90"
        >
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Promo Banner Section */}
      <Card className="overflow-hidden rounded-2xl border-outline-variant/70 shadow-none">
        <CardHeader className="border-b border-outline-variant/60 bg-blush/40 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-serif text-xl font-bold">Promo Banner</CardTitle>
                <CardDescription className="mt-0.5">
                  Small horizontal strip shown above the header on all customer pages
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {form.promoEnabled === "true" ? (
                  <span className="flex items-center gap-1 text-primary"><Eye className="h-3 w-3" /> Visible</span>
                ) : (
                  <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" /> Hidden</span>
                )}
              </span>
              <Switch
                checked={form.promoEnabled === "true"}
                onCheckedChange={(v) => set("promoEnabled", v ? "true" : "false")}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          {/* Live preview */}
          {form.promoEnabled === "true" && (form.promoText || form.promoPercent) && (
            <div className="relative overflow-hidden rounded-lg bg-secondary px-4 py-2.5 text-white">
              <div className="pointer-events-none absolute -left-10 top-0 h-8 w-32 rounded-full bg-primary-container/20 blur-2xl" />
              <div className="relative flex items-center justify-center gap-3">
                {form.promoPercent && (
                  <span className="inline-flex items-center rounded-full bg-primary-container px-2 py-0.5 text-xs font-bold text-secondary">
                    -{form.promoPercent}%
                  </span>
                )}
                {form.promoText && (
                  <span className="text-sm font-semibold">{form.promoText}</span>
                )}
                <span className="text-xs font-bold underline-offset-2 underline">Shop Now</span>
              </div>
            </div>
          )}

          {/* Percent + Link row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Sale Percent
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.promoPercent || ""}
                  onChange={(e) => set("promoPercent", e.target.value)}
                  placeholder="30"
                  className="border-outline-variant bg-blush/50 pr-8 focus:border-primary focus:bg-card"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-primary">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Link (where clicking goes)
              </Label>
              <Input
                value={form.promoLink || ""}
                onChange={(e) => set("promoLink", e.target.value)}
                placeholder="#/services"
                className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"
              />
            </div>
          </div>

          {/* Promo text - EN */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
              🇬🇧 Promo Text (English)
            </Label>
            <Input
              value={form.promoText || ""}
              onChange={(e) => set("promoText", e.target.value)}
              placeholder="Summer Sale - Book any laser package this month"
              className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"
            />
          </div>

          {/* Promo text - AR */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
              🇸🇦 Promo Text (Arabic)
            </Label>
            <Input
              value={form.promoTextAr || ""}
              onChange={(e) => set("promoTextAr", e.target.value)}
              placeholder="تخفيضات الصيف - احجزي أي باقة ليزر هذا الشهر"
              className="border-outline-variant bg-blush/50 text-right focus:border-primary focus:bg-card"
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hero Section Content */}
      <Card className="overflow-hidden rounded-2xl border-outline-variant/70 shadow-none">
        <CardHeader className="border-b border-outline-variant/60 bg-blush/40 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl font-bold">Home Hero Section</CardTitle>
              <CardDescription className="mt-0.5">
                The main headline and subtitle on the home page
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          {/* Badge */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇬🇧 Badge (English)</Label>
              <Input
                value={form.heroBadge || ""}
                onChange={(e) => set("heroBadge", e.target.value)}
                placeholder="Premium Laser & Beauty Clinic"
                className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇸🇦 Badge (Arabic)</Label>
              <Input
                value={form.heroBadgeAr || ""}
                onChange={(e) => set("heroBadgeAr", e.target.value)}
                placeholder="عيادة الليزر والتجميل"
                className="border-outline-variant bg-blush/50 text-right focus:border-primary focus:bg-card"
                dir="rtl"
              />
            </div>
          </div>

          {/* Title */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇬🇧 Title Line 1</Label>
              <Input
                value={form.heroTitle1 || ""}
                onChange={(e) => set("heroTitle1", e.target.value)}
                placeholder="Reveal Your Smoothest,"
                className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇸🇦 Title Line 1 (Arabic)</Label>
              <Input
                value={form.heroTitle1Ar || ""}
                onChange={(e) => set("heroTitle1Ar", e.target.value)}
                placeholder=""
                className="border-outline-variant bg-blush/50 text-right focus:border-primary focus:bg-card"
                dir="rtl"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇬🇧 Title Line 2 (highlighted)</Label>
              <Input
                value={form.heroTitle2 || ""}
                onChange={(e) => set("heroTitle2", e.target.value)}
                placeholder="Most Confident Self"
                className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇸🇦 Title Line 2 (Arabic)</Label>
              <Input
                value={form.heroTitle2Ar || ""}
                onChange={(e) => set("heroTitle2Ar", e.target.value)}
                placeholder=""
                className="border-outline-variant bg-blush/50 text-right focus:border-primary focus:bg-card"
                dir="rtl"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇬🇧 Subtitle (English)</Label>
            <Textarea
              rows={2}
              value={form.heroSubtitle || ""}
              onChange={(e) => set("heroSubtitle", e.target.value)}
              placeholder="Premium Laser Waxing & Beauty Care..."
                           className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇸🇦 Subtitle (Arabic)</Label>
            <Textarea
              rows={2}
              value={form.heroSubtitleAr || ""}
              onChange={(e) => set("heroSubtitleAr", e.target.value)}
              placeholder=""
              className="border-outline-variant bg-blush/50 text-right focus:border-primary focus:bg-card"
              dir="rtl"
            />
          </div>

          {/* Hero Image */}
          <ImageUpload
            value={form.heroImage || ""}
            onChange={(url) => set("heroImage", url)}
            label="Hero Image (optional - replaces solid color card)"
          />
        </CardContent>
      </Card>

      {/* Final CTA Section */}
      <Card className="overflow-hidden rounded-2xl border-outline-variant/70 shadow-none">
        <CardHeader className="border-b border-outline-variant/60 bg-blush/40 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl font-bold">Final CTA Section</CardTitle>
              <CardDescription className="mt-0.5">
                The call-to-action banner at the bottom of the home page
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇬🇧 CTA Title</Label>
              <Input
                value={form.ctaTitle || ""}
                onChange={(e) => set("ctaTitle", e.target.value)}
                placeholder="Ready to Begin Your Beauty Journey?"
                className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇸🇦 CTA Title (Arabic)</Label>
              <Input
                value={form.ctaTitleAr || ""}
                onChange={(e) => set("ctaTitleAr", e.target.value)}
                placeholder=""
                className="border-outline-variant bg-blush/50 text-right focus:border-primary focus:bg-card"
                dir="rtl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇬🇧 CTA Subtitle</Label>
            <Textarea
              rows={2}
              value={form.ctaSubtitle || ""}
              onChange={(e) => set("ctaSubtitle", e.target.value)}
              placeholder="Book your appointment online in under 60 seconds..."
              className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">🇸🇦 CTA Subtitle (Arabic)</Label>
            <Textarea
              rows={2}
              value={form.ctaSubtitleAr || ""}
              onChange={(e) => set("ctaSubtitleAr", e.target.value)}
              placeholder=""
              className="border-outline-variant bg-blush/50 text-right focus:border-primary focus:bg-card"
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save button at bottom */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="btn-press bg-primary hover:bg-primary/90"
        >
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Changes
        </Button>
      </div>
    </div>
  )
}
