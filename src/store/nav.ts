// SPA navigation store - client-side routing via state + URL hash sync
// Supports both customer routes and admin routes within the single `/` page

import { create } from "zustand"

export type Route =
  // customer
  | { name: "home" }
  | { name: "services" }
  | { name: "service_detail"; serviceId: string }
  | { name: "booking"; serviceId?: string }
  | { name: "shop" }
  | { name: "product_detail"; productId: string }
  | { name: "cart" }
  | { name: "checkout" }
  | { name: "order_success"; orderId: string }
  | { name: "contact" }
  // admin
  | { name: "admin_login" }
  | { name: "admin_dashboard" }
  | { name: "admin_calendar" }
  | { name: "admin_slots" }
  | { name: "admin_services" }
  | { name: "admin_service_categories" }
  | { name: "admin_products" }
  | { name: "admin_orders" }
  | { name: "admin_appointments" }
  | { name: "admin_customers" }
  | { name: "admin_financials" }
  | { name: "admin_settings" }
  | { name: "admin_home_content" }
  | { name: "admin_product_categories" }

interface NavState {
  route: Route
  history: Route[]
  navigate: (route: Route) => void
  back: () => void
  isAdmin: boolean
  setAdmin: (v: boolean) => void
}

function parseHash(): Route {
  if (typeof window === "undefined") return { name: "home" }
  const hash = window.location.hash.replace(/^#\/?/, "")
  if (!hash) return { name: "home" }
  const [path, queryStr] = hash.split("?")
  const parts = path.split("/").filter(Boolean)
  const query = new URLSearchParams(queryStr || "")
  const id = query.get("id") || ""

  const map: Record<string, Route> = {
    home: { name: "home" },
    services: { name: "services" },
    service_detail: { name: "service_detail", serviceId: id },
    booking: { name: "booking", serviceId: id || undefined },
    shop: { name: "shop" },
    product_detail: { name: "product_detail", productId: id },
    cart: { name: "cart" },
    checkout: { name: "checkout" },
    order_success: { name: "order_success", orderId: id },
    contact: { name: "contact" },
    admin: { name: "admin_login" },
    admin_dashboard: { name: "admin_dashboard" },
    admin_calendar: { name: "admin_calendar" },
    admin_slots: { name: "admin_slots" },
    admin_services: { name: "admin_services" },
    admin_service_categories: { name: "admin_service_categories" },
    admin_products: { name: "admin_products" },
    admin_orders: { name: "admin_orders" },
    admin_appointments: { name: "admin_appointments" },
    admin_customers: { name: "admin_customers" },
    admin_financials: { name: "admin_financials" },
    admin_settings: { name: "admin_settings" },
    admin_home_content: { name: "admin_home_content" },
    admin_product_categories: { name: "admin_product_categories" },
  }
  return map[parts[0]] || { name: "home" }
}

function routeToHash(route: Route): string {
  const idParam = (id?: string) => (id ? `?id=${encodeURIComponent(id)}` : "")
  switch (route.name) {
    case "home": return "#/home"
    case "services": return "#/services"
    case "service_detail": return `#/service_detail${idParam(route.serviceId)}`
    case "booking": return `#/booking${idParam(route.serviceId)}`
    case "shop": return "#/shop"
    case "product_detail": return `#/product_detail${idParam(route.productId)}`
    case "cart": return "#/cart"
    case "checkout": return "#/checkout"
    case "order_success": return `#/order_success${idParam(route.orderId)}`
    case "contact": return "#/contact"
    case "admin_login": return "#/admin"
    case "admin_dashboard": return "#/admin_dashboard"
    case "admin_calendar": return "#/admin_calendar"
    case "admin_slots": return "#/admin_slots"
    case "admin_services": return "#/admin_services"
    case "admin_service_categories": return "#/admin_service_categories"
    case "admin_products": return "#/admin_products"
    case "admin_orders": return "#/admin_orders"
    case "admin_appointments": return "#/admin_appointments"
    case "admin_customers": return "#/admin_customers"
    case "admin_financials": return "#/admin_financials"
    case "admin_settings": return "#/admin_settings"
    case "admin_home_content": return "#/admin_home_content"
    case "admin_product_categories": return "#/admin_product_categories"
  }
}

export const useNav = create<NavState>((set, get) => ({
  route: typeof window !== "undefined" ? parseHash() : { name: "home" },
  history: [],
  isAdmin: false,
  navigate: (route) => {
    if (typeof window !== "undefined") {
      const hash = routeToHash(route)
      if (window.location.hash !== hash) {
        window.location.hash = hash
      }
    }
    set((s) => ({
      route,
      history: [...s.history, s.route].slice(-20),
      isAdmin: route.name.startsWith("admin_") && route.name !== "admin_login",
    }))
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  },
  back: () => {
    const hist = get().history
    if (hist.length > 0) {
      const prev = hist[hist.length - 1]
      get().navigate(prev)
    } else {
      get().navigate({ name: "home" })
    }
  },
  setAdmin: (v) => set({ isAdmin: v }),
}))

// Listen to hashchange events (back/forward browser buttons)
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    const route = parseHash()
    useNav.setState((s) => ({
      route,
      isAdmin: route.name.startsWith("admin_") && route.name !== "admin_login",
    }))
  })
}
