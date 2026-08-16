"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"

export interface SiteSettings {
  // Promo banner
  promoEnabled: string    // "true" | "false"
  promoText: string       // e.g. "Summer Sale"
  promoTextAr: string     // Arabic version
  promoPercent: string    // e.g. "30"
  promoLink: string       // e.g. "#/services"
  // Home page content
  heroTitle1: string
  heroTitle2: string
  heroTitle1Ar: string
  heroTitle2Ar: string
  heroSubtitle: string
  heroSubtitleAr: string
  heroBadge: string
  heroBadgeAr: string
  heroImage: string       // URL or empty
  // Final CTA
  ctaTitle: string
  ctaTitleAr: string
  ctaSubtitle: string
  ctaSubtitleAr: string
  [key: string]: string
}

const DEFAULTS: SiteSettings = {
  promoEnabled: "false",
  promoText: "",
  promoTextAr: "",
  promoPercent: "",
  promoLink: "#/services",
  heroTitle1: "Reveal Your Smoothest,",
  heroTitle2: "Most Confident Self",
  heroTitle1Ar: "",
  heroTitle2Ar: "",
  heroSubtitle: "Premium Laser Waxing & Beauty Care. Professional laser waxing, advanced skincare treatments, and premium aftercare products — all in one tranquil Nablus studio.",
  heroSubtitleAr: "",
  heroBadge: "Premium Laser & Beauty Clinic",
  heroBadgeAr: "",
  heroImage: "",
  ctaTitle: "Ready to Begin Your Beauty Journey?",
  ctaTitleAr: "",
  ctaSubtitle: "Book your appointment online in under 60 seconds. Available time slots shown in real-time.",
  ctaSubtitleAr: "",
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiGet<{ settings: Record<string, string> }>("/api/site-settings"),
    staleTime: 30_000,
  })
}

export function getSettings(raw: Record<string, string> | undefined): SiteSettings {
  if (!raw) return DEFAULTS
  return { ...DEFAULTS, ...raw }
}
