"use client"

import { useEffect } from "react"
import { useNav, type Route } from "@/store/nav"
import { useAuth } from "@/store/auth"
import { CLINIC_NAME } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard, Calendar, Clock, Sparkles, Package, ShoppingCart,
  Users, Receipt, Settings, LogOut, Menu, X, Bell,
} from "lucide-react"
import { useState } from "react"
import {
  Sheet, SheetContent, SheetTitle, SheetClose,
} from "@/components/ui/sheet"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"

interface NavItem {
  label: string
  route: Route
  icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", route: { name: "admin_dashboard" }, icon: LayoutDashboard },
  { label: "Calendar", route: { name: "admin_calendar" }, icon: Calendar },
  { label: "Appointments", route: { name: "admin_appointments" }, icon: Clock },
  { label: "Time Slots", route: { name: "admin_slots" }, icon: Bell },
  { label: "Services", route: { name: "admin_services" }, icon: Sparkles },
  { label: "Products", route: { name: "admin_products" }, icon: Package },
  { label: "Orders", route: { name: "admin_orders" }, icon: ShoppingCart },
  { label: "Customers", route: { name: "admin_customers" }, icon: Users },
  { label: "Financials", route: { name: "admin_financials" }, icon: Receipt },
  { label: "Settings", route: { name: "admin_settings" }, icon: Settings },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNav((s) => s.navigate)
  const currentRoute = useNav((s) => s.route)
  const logout = useAuth((s) => s.logout)
  const admin = useAuth((s) => s.admin)

  const { data: lowStockData } = useQuery({
    queryKey: ["products", "low-stock"],
    queryFn: () => apiGet<{ products: { id: string }[] }>("/api/products/low-stock"),
    refetchInterval: 60000,
  })
  const lowStockCount = lowStockData?.products?.length || 0

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-sm shadow-rose-500/30">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-bold tracking-tight">{CLINIC_NAME.split(" ")[0]} Admin</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            Management Portal
          </div>
        </div>
        {onNavigate && (
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" aria-label="Close menu">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        )}
      </div>

      {/* Nav — grouped with section labels */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Section: Overview */}
        <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Overview
        </div>
        <div className="space-y-0.5">
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const isActive = currentRoute.name === item.route.name
            const showBadge = item.route.name === "admin_products" && lowStockCount > 0
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.route)
                  onNavigate?.()
                }}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-rose-500 to-rose-600 font-medium text-white shadow-sm shadow-rose-500/25"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-rose-500" />
                )}
                <item.icon className={`h-[18px] w-[18px] flex-shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {showBadge && (
                  <Badge variant="secondary" className="h-5 min-w-5 bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                    {lowStockCount}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Section: Catalog */}
        <div className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Catalog
        </div>
        <div className="space-y-0.5">
          {NAV_ITEMS.slice(4, 7).map((item) => {
            const isActive = currentRoute.name === item.route.name
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.route)
                  onNavigate?.()
                }}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-rose-500 to-rose-600 font-medium text-white shadow-sm shadow-rose-500/25"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-rose-500" />
                )}
                <item.icon className={`h-[18px] w-[18px] flex-shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Section: Insights */}
        <div className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Insights
        </div>
        <div className="space-y-0.5">
          {NAV_ITEMS.slice(7, 9).map((item) => {
            const isActive = currentRoute.name === item.route.name
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.route)
                  onNavigate?.()
                }}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-rose-500 to-rose-600 font-medium text-white shadow-sm shadow-rose-500/25"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-rose-500" />
                )}
                <item.icon className={`h-[18px] w-[18px] flex-shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Section: System */}
        <div className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          System
        </div>
        <div className="space-y-0.5">
          {NAV_ITEMS.slice(9).map((item) => {
            const isActive = currentRoute.name === item.route.name
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.route)
                  onNavigate?.()
                }}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-rose-500 to-rose-600 font-medium text-white shadow-sm shadow-rose-500/25"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-rose-500" />
                )}
                <item.icon className={`h-[18px] w-[18px] flex-shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* User card */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-sidebar-accent/50 p-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-xs font-bold text-white shadow-sm">
            {admin?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-semibold">{admin?.name || "Admin"}</div>
            <div className="truncate text-[11px] text-muted-foreground">{admin?.email}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:bg-rose-100 hover:text-rose-600"
            onClick={async () => {
              await logout()
              navigate({ name: "home" })
            }}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNav((s) => s.navigate)
  const fetchMe = useAuth((s) => s.fetchMe)
  const admin = useAuth((s) => s.admin)
  const loaded = useAuth((s) => s.loaded)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!loaded) fetchMe()
  }, [loaded, fetchMe])

  // Auth guard
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    // Auto-redirect to login
    if (typeof window !== "undefined") {
      const { route } = useNav.getState()
      if (route.name !== "admin_login") {
        navigate({ name: "admin_login" })
      }
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => navigate({ name: "admin_login" })}>
          Go to admin login
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 flex-shrink-0 border-r border-border">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 font-semibold">{CLINIC_NAME.split(" ")[0]} Admin</div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
