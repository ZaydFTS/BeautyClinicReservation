"use client"

import { useEffect } from"react"
import { useNav, type Route } from"@/store/nav"
import { useAuth } from"@/store/auth"
import { useLang } from"@/store/lang"
import { CLINIC_NAME } from"@/lib/constants"
import { Button } from"@/components/ui/button"
import { Badge } from"@/components/ui/badge"
import { LanguageSwitcher } from"@/components/shared/language-switcher"
import {
 LayoutDashboard, Calendar, Clock, Sparkles, Package, ShoppingCart,
 Users, Receipt, Settings, LogOut, Menu, X, Bell, Tag, Tags, Home, Percent,
} from "lucide-react"
import { useState } from"react"
import {
 Sheet, SheetContent, SheetTitle, SheetClose,
} from"@/components/ui/sheet"
import { useQuery } from"@tanstack/react-query"
import { apiGet } from"@/lib/api-client"

interface NavItem {
 labelKey: string
 route: Route
 icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
 { labelKey:"adminNav.dashboard", route: { name:"admin_dashboard" }, icon: LayoutDashboard },
 { labelKey:"adminNav.calendar", route: { name:"admin_calendar" }, icon: Calendar },
 { labelKey:"adminNav.appointments", route: { name:"admin_appointments" }, icon: Clock },
 { labelKey:"adminNav.timeSlots", route: { name:"admin_slots" }, icon: Bell },
 { labelKey:"adminNav.services", route: { name:"admin_services" }, icon: Sparkles },
 { labelKey:"adminNav.serviceCategories", route: { name:"admin_service_categories" }, icon: Tag },
 { labelKey:"adminNav.products", route: { name:"admin_products" }, icon: Package },
 { labelKey:"adminNav.productCategories", route: { name:"admin_product_categories" }, icon: Tags },
 { labelKey:"adminNav.discounts", route: { name:"admin_discounts" }, icon: Percent },
 { labelKey:"adminNav.orders", route: { name:"admin_orders" }, icon: ShoppingCart },
 { labelKey:"adminNav.customers", route: { name:"admin_customers" }, icon: Users },
 { labelKey:"adminNav.financials", route: { name:"admin_financials" }, icon: Receipt },
 { labelKey:"adminNav.settings", route: { name:"admin_settings" }, icon: Settings },
 { labelKey:"adminNav.homeContent", route: { name:"admin_home_content" }, icon: Home },
]

// Section grouping: [startIndex, endIndex, labelKey]
const NAV_SECTIONS: [number, number, string][] = [
 [0, 4,"adminNav.overview"], // Dashboard, Calendar, Appointments, Time Slots
 [4, 9,"adminNav.catalog"], // Services, Service Categories, Products, Product Categories, Discounts
 [9, 11,"adminNav.insights"], // Orders, Customers
 [11, 14,"adminNav.system"], // Financials, Settings, Home Content
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
 const navigate = useNav((s) => s.navigate)
 const currentRoute = useNav((s) => s.route)
 const logout = useAuth((s) => s.logout)
 const admin = useAuth((s) => s.admin)
 const t = useLang((s) => s.t)

 const { data: lowStockData } = useQuery({
 queryKey: ["products","low-stock"],
 queryFn: () => apiGet<{ products: { id: string }[] }>("/api/products/low-stock"),
 refetchInterval: 60000,
 })
 const lowStockCount = lowStockData?.products?.length || 0

 return (
 <div className="flex h-full flex-col bg-sidebar">
 {/* Logo / Brand */}
 <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
 <img src="/logo.png" alt="Glow Beauty Clinic" className="h-9 w-9 rounded-lg object-cover" />
 <div className="flex-1 min-w-0">
 <div className="truncate font-serif text-sm font-bold tracking-tight">{CLINIC_NAME.split("")[0]} {t("nav.book") ==="حجز" ?"إدارة" :"Admin"}</div>
 <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
 {t("adminNav.managementPortal")}
 </div>
 </div>
 {onNavigate && (
 <SheetClose asChild>
 <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" aria-label={t("nav.closeMenu")}>
 <X className="h-4 w-4" />
 </Button>
 </SheetClose>
 )}
 </div>

 {/* Nav - grouped with section labels */}
 <nav className="flex-1 overflow-y-auto px-3 py-4">
 {NAV_SECTIONS.map(([start, end, sectionKey]) => (
 <div key={sectionKey} className="mb-1 last:mb-0">
 <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
 {t(sectionKey)}
 </div>
 <div className="space-y-0.5">
 {NAV_ITEMS.slice(start, end).map((item) => {
 const isActive = currentRoute.name === item.route.name
 const showBadge = item.route.name ==="admin_products" && lowStockCount > 0
 return (
 <button
 key={item.labelKey}
 onClick={() => {
 navigate(item.route)
 onNavigate?.()
 }}
 className={`press-feedback group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
 isActive
 ?"bg-primary"
 :"text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
 }`}
 >
 {isActive && (
 <span className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
 )}
 <item.icon className={`arrow-slide h-[18px] w-[18px] flex-shrink-0 transition-transform ${isActive ?"" :"group-hover:scale-110"}`} />
 <span className="flex-1 text-start">{t(item.labelKey)}</span>
 {showBadge && (
 <Badge variant="secondary" className="h-5 min-w-5 bg-primary px-1.5 text-[10px] font-bold text-white">
 {lowStockCount}
 </Badge>
 )}
 </button>
 )
 })}
 </div>
 <div className="mt-4" />
 </div>
 ))}
 </nav>

 {/* Language switcher + User card */}
 <div className="border-t border-sidebar-border p-3">
 <div className="mb-2 flex justify-center">
 <LanguageSwitcher variant="outline" />
 </div>
 <div className="flex items-center gap-2.5 rounded-xl bg-sidebar-accent/50 p-2.5">
 <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary">
 {admin?.name?.[0]?.toUpperCase() ||"A"}
 </div>
 <div className="flex-1 min-w-0">
 <div className="truncate text-sm font-semibold">{admin?.name ||"Admin"}</div>
 <div className="truncate text-[11px] text-muted-foreground">{admin?.email}</div>
 </div>
 <Button
 variant="ghost"
 size="icon"
 className="press-feedback h-8 w-8 flex-shrink-0 text-muted-foreground hover:bg-blush hover:text-primary"
 onClick={async () => {
 await logout()
 navigate({ name:"home" })
 }}
 aria-label={t("adminNav.signOut")}
 title={t("adminNav.signOut")}
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
 const t = useLang((s) => s.t)
 const [mobileOpen, setMobileOpen] = useState(false)

 useEffect(() => {
 if (!loaded) fetchMe()
 }, [loaded, fetchMe])

 // Auth guard
 if (!loaded) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
 <p className="mt-2 text-sm text-muted-foreground">{t("common.loading")}</p>
 </div>
 </div>
 )
 }

 if (!admin) {
 if (typeof window !=="undefined") {
 const { route } = useNav.getState()
 if (route.name !=="admin_login") {
 navigate({ name:"admin_login" })
 }
 }
 return (
 <div className="min-h-screen flex items-center justify-center">
 <Button onClick={() => navigate({ name:"admin_login" })}>
 {t("nav.adminLogin")}
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
 <SheetContent side="left" className="hide-auto-close w-64 p-0">
 <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>
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
 className="press-feedback h-9 w-9"
 onClick={() => setMobileOpen(true)}
 aria-label={t("nav.openMenu")}
 >
 <Menu className="h-5 w-5" />
 </Button>
 <div className="flex-1 font-serif font-bold">{CLINIC_NAME.split("")[0]} {t("nav.book") ==="حجز" ?"إدارة" :"Admin"}</div>
 <LanguageSwitcher />
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
