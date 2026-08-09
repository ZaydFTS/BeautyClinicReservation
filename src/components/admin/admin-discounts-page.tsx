"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPut } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Percent, Save, Loader2, Tag, Package, Sparkles, AlertCircle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Reveal } from "@/components/shared/reveal"

interface DiscountConfig {
  enabled: boolean
  scope: "all_services" | "all_products" | "all" | "service_category" | "product_category"
  targetType: "service" | "product" | "all"
  categoryId: string | null
  percent: number
  label: string
  labelAr: string
}

interface Category {
  id: string
  name: string
}

const DEFAULT_CONFIG: DiscountConfig = {
  enabled: false,
  scope: "all",
  targetType: "all",
  categoryId: null,
  percent: 0,
  label: "",
  labelAr: "",
}

export function AdminDiscountsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["discount"],
    queryFn: () => apiGet<{ discount: DiscountConfig }>("/api/discounts"),
  })

  // Fetch service categories and product categories
  const { data: svcCatsData } = useQuery({
    queryKey: ["service-categories"],
    queryFn: () => apiGet<{ categories: Category[] }>("/api/service-categories"),
  })
  const { data: prodCatsData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<{ categories: Category[] }>("/api/categories"),
  })

  const [form, setForm] = useState<DiscountConfig>(DEFAULT_CONFIG)
  const [loaded, setLoaded] = useState(false)

  if (!loaded && data) {
    setForm({ ...DEFAULT_CONFIG, ...data.discount })
    setLoaded(true)
  }

  const updateMutation = useMutation({
    mutationFn: (config: DiscountConfig) => apiPut("/api/discounts", config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discount"] })
      toast.success("Discount settings saved")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSave = () => {
    if (form.enabled && form.percent <= 0) {
      toast.error("Discount percent must be greater than 0 when enabled")
      return
    }
    if (form.enabled && (form.scope === "service_category" || form.scope === "product_category") && !form.categoryId) {
      toast.error("Please select a category for category-specific discounts")
      return
    }
    // Auto-set targetType based on scope to prevent conflicts
    const targetType = form.scope === "all" ? "all"
      : form.scope === "all_services" || form.scope === "service_category" ? "service"
      : form.scope === "all_products" || form.scope === "product_category" ? "product"
      : "all"
    updateMutation.mutate({ ...form, targetType })
  }

  const set = <K extends keyof DiscountConfig>(key: K, value: DiscountConfig[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return <div className="h-64 shimmer rounded-lg" />
  }

  const svcCategories = svcCatsData?.categories || []
  const prodCategories = prodCatsData?.categories || []
  const isCategoryScope = form.scope === "service_category" || form.scope === "product_category"
  const availableCategories = form.scope === "service_category" ? svcCategories : prodCategories

  // Preview: calculate a sample discounted price
  const samplePrice = 100
  const sampleDiscounted = form.percent > 0 ? Math.round((samplePrice - samplePrice * form.percent / 100) * 100) / 100 : samplePrice

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-8 bg-primary" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Promotions
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Discounts & Sales
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Apply percentage discounts to all services, all products, or specific categories.
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
          Save Discount
        </Button>
      </div>

      {/* Active status banner */}
      <Card className={`overflow-hidden rounded-2xl border shadow-none ${form.enabled ? "border-primary bg-blush" : "border-outline-variant/70 bg-card"}`}>
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${form.enabled ? "bg-primary" : "bg-blush"}`}>
              {form.enabled ? (
                <Eye className="h-6 w-6 text-white" />
              ) : (
                <EyeOff className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <div className="font-serif text-lg font-bold text-foreground">
                {form.enabled ? "Discount Active" : "Discount Inactive"}
              </div>
              <div className="text-sm text-muted-foreground">
                {form.enabled
                  ? `${form.percent}% off ${form.scope === "all" ? "everything" : form.scope === "all_services" ? "all services" : form.scope === "all_products" ? "all products" : "selected category"}`
                  : "Enable the toggle below to apply discounts"}
              </div>
            </div>
          </div>
          <Switch
            checked={form.enabled}
            onCheckedChange={(v) => set("enabled", v)}
          />
        </CardContent>
      </Card>

      {/* Discount Configuration */}
      <Card className="overflow-hidden rounded-2xl border-outline-variant/70 shadow-none">
        <CardHeader className="border-b border-outline-variant/60 bg-blush/40 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
              <Percent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl font-bold">Discount Configuration</CardTitle>
              <CardDescription className="mt-0.5">
                Choose what gets discounted and by how much
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          {/* Discount Percent */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Discount Percent <span className="text-primary">*</span>
            </Label>
            <div className="relative max-w-xs">
              <Input
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.percent || ""}
                onChange={(e) => set("percent", Number(e.target.value))}
                placeholder="20"
                className="border-outline-variant bg-blush/50 pr-8 text-lg font-bold focus:border-primary focus:bg-card"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg font-bold text-primary">%</span>
            </div>
            <p className="text-xs text-muted-foreground">Enter a value between 0 and 100</p>
          </div>

          {/* Scope - what to discount */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Apply To
            </Label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ScopeOption
                active={form.scope === "all"}
                onClick={() => set("scope", "all")}
                icon={<Sparkles className="h-5 w-5" />}
                title="Everything"
                desc="All services & products"
              />
              <ScopeOption
                active={form.scope === "all_services"}
                onClick={() => set("scope", "all_services")}
                icon={<Sparkles className="h-5 w-5" />}
                title="All Services"
                desc="Discount all treatments"
              />
              <ScopeOption
                active={form.scope === "all_products"}
                onClick={() => set("scope", "all_products")}
                icon={<Package className="h-5 w-5" />}
                title="All Products"
                desc="Discount all shop items"
              />
              <ScopeOption
                active={form.scope === "service_category"}
                onClick={() => set("scope", "service_category")}
                icon={<Tag className="h-5 w-5" />}
                title="Service Category"
                desc="Pick a specific service category"
              />
              <ScopeOption
                active={form.scope === "product_category"}
                onClick={() => set("scope", "product_category")}
                icon={<Tag className="h-5 w-5" />}
                title="Product Category"
                desc="Pick a specific product category"
              />
            </div>
          </div>

          {/* Category selector (only for category-specific scopes) */}
          {isCategoryScope && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                {form.scope === "service_category" ? "Service Category" : "Product Category"} <span className="text-primary">*</span>
              </Label>
              {availableCategories.length === 0 ? (
                <div className="rounded-lg border border-dashed border-outline-variant/70 bg-blush p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    No {form.scope === "service_category" ? "service" : "product"} categories yet. Create some first.
                  </p>
                </div>
              ) : (
                <Select
                  value={form.categoryId || ""}
                  onValueChange={(v) => set("categoryId", v)}
                >
                  <SelectTrigger className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Labels (bilingual) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                🇬🇧 Sale Label (English)
              </Label>
              <Input
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                placeholder="Summer Sale"
                className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                🇸🇦 Sale Label (Arabic)
              </Label>
              <Input
                value={form.labelAr}
                onChange={(e) => set("labelAr", e.target.value)}
                placeholder="تخفيضات الصيف"
                className="border-outline-variant bg-blush/50 text-right focus:border-primary focus:bg-card"
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Reveal>
        <Card className="overflow-hidden rounded-2xl border-outline-variant/70 shadow-none">
          <CardHeader className="border-b border-outline-variant/60 bg-blush/40 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-serif text-xl font-bold">Live Preview</CardTitle>
                <CardDescription className="mt-0.5">
                  How customers will see the discounted prices
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {form.enabled && form.percent > 0 ? (
              <div className="flex flex-col gap-4">
                {/* Badge */}
                {form.label && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                      -{form.percent}%
                    </span>
                    <span className="text-sm font-semibold text-foreground">{form.label}</span>
                  </div>
                )}
                {/* Price preview */}
                <div className="flex items-center gap-4 rounded-xl border border-outline-variant/60 bg-blush/30 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blush">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">Sample Treatment</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">${sampleDiscounted.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground line-through">${samplePrice.toFixed(2)}</span>
                      <span className="inline-flex items-center rounded-full bg-primary-container/30 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Save ${(samplePrice - sampleDiscounted).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Scope: <span className="font-semibold text-secondary">
                    {form.scope === "all" ? "All services & products" :
                     form.scope === "all_services" ? "All services" :
                     form.scope === "all_products" ? "All products" :
                     form.scope === "service_category" ? `Service category: ${svcCategories.find(c => c.id === form.categoryId)?.name || "—"}` :
                     `Product category: ${prodCategories.find(c => c.id === form.categoryId)?.name || "—"}`}
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-outline-variant/70 bg-blush/30 p-6 text-center">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Enable the discount and set a percent above to see a preview of how prices will appear to customers.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </Reveal>

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
          Save Discount Settings
        </Button>
      </div>
    </div>
  )
}

function ScopeOption({
  active, onClick, icon, title, desc,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`press-feedback relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
        active
          ? "border-primary bg-blush shadow-sm"
          : "border-outline-variant/70 bg-card hover:border-primary/50 hover:bg-blush/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-primary text-white" : "bg-blush text-primary"
        }`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className={`text-sm font-bold ${active ? "text-primary" : "text-foreground"}`}>{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      {active && (
        <div className="absolute right-2 top-2">
          <span className="flex h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
    </button>
  )
}
