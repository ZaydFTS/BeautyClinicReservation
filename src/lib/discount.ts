"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"

export interface DiscountConfig {
  enabled: boolean
  scope: "all_services" | "all_products" | "all" | "service_category" | "product_category"
  targetType: "service" | "product" | "all"
  categoryId: string | null
  percent: number
  label: string
  labelAr: string
}

const DEFAULT_DISCOUNT: DiscountConfig = {
  enabled: false,
  scope: "all",
  targetType: "all",
  categoryId: null,
  percent: 0,
  label: "",
  labelAr: "",
}

export function useDiscount() {
  return useQuery({
    queryKey: ["discount"],
    queryFn: () => apiGet<{ discount: DiscountConfig }>("/api/discounts"),
    staleTime: 30_000,
  })
}

export function getDiscount(raw: DiscountConfig | undefined): DiscountConfig {
  return { ...DEFAULT_DISCOUNT, ...(raw || {}) }
}

/**
 * Check if a given item (service or product) is discounted.
 * Returns the discount percent (0-100) if applicable, or 0.
 */
export function getDiscountPercent(
  discount: DiscountConfig,
  itemType: "service" | "product",
  categoryId: string | null
): number {
  if (!discount.enabled || discount.percent <= 0) return 0

  // Check if this item type is targeted
  if (discount.targetType !== "all" && discount.targetType !== itemType) return 0

  // Check scope
  if (discount.scope === "all") return discount.percent
  if (discount.scope === "all_services" && itemType === "service") return discount.percent
  if (discount.scope === "all_products" && itemType === "product") return discount.percent

  // Category-specific scope
  if (discount.scope === "service_category" && itemType === "service") {
    return discount.categoryId && categoryId === discount.categoryId ? discount.percent : 0
  }
  if (discount.scope === "product_category" && itemType === "product") {
    return discount.categoryId && categoryId === discount.categoryId ? discount.percent : 0
  }

  return 0
}

/**
 * Calculate the discounted price.
 * Returns { original, discounted, percent, hasDiscount }
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discount: DiscountConfig,
  itemType: "service" | "product",
  categoryId: string | null
): { original: number; discounted: number; percent: number; hasDiscount: boolean } {
  const percent = getDiscountPercent(discount, itemType, categoryId)
  if (percent <= 0) {
    return { original: originalPrice, discounted: originalPrice, percent: 0, hasDiscount: false }
  }
  const discountAmount = originalPrice * (percent / 100)
  return {
    original: originalPrice,
    discounted: Math.round((originalPrice - discountAmount) * 100) / 100,
    percent,
    hasDiscount: true,
  }
}
