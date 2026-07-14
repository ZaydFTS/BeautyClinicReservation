"use client"

import { useNav } from "@/store/nav"
import { useCart } from "@/store/cart"
import { useLang } from "@/store/lang"
import { CLINIC_NAME, CLINIC_PHONE, CLINIC_EMAIL, CLINIC_ADDRESS } from "@/lib/constants"
import {
  Sparkles, Menu, ShoppingCart, Calendar, Phone, MapPin,
  Instagram, Facebook, Mail, Home, Scissors, CalendarCheck,
  ShoppingBag, MessageCircle, ChevronRight, Shield, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose,
} from "@/components/ui/sheet"
import { LanguageSwitcher } from "@/components/shared/language-switcher"
import { useState } from "react"

const NAV_LINKS: {
  labelKey: string
  route: Parameters<ReturnType<typeof useNav>["navigate"]>[0]
  icon: typeof Home
  descKey: string
}[] = [
  { labelKey: "nav.home", route: { name: "home" }, icon: Home, descKey: "mobileMenu.homeDesc" },
  { labelKey: "nav.services", route: { name: "services" }, icon: Scissors, descKey: "mobileMenu.servicesDesc" },
  { labelKey: "nav.book", route: { name: "booking" }, icon: CalendarCheck, descKey: "mobileMenu.bookDesc" },
  { labelKey: "nav.shop", route: { name: "shop" }, icon: ShoppingBag, descKey: "mobileMenu.shopDesc" },
  { labelKey: "nav.contact", route: { name: "contact" }, icon: MessageCircle, descKey: "mobileMenu.contactDesc" },
]

export function CustomerHeader() {
  const navigate = useNav((s) => s.navigate)
  const currentRoute = useNav((s) => s.route)
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const t = useLang((s) => s.t)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => navigate({ name: "home" })}
          className="flex items-center gap-2 transition-transform hover:scale-[1.02]"
          aria-label={t("nav.home")}
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 opacity-0 blur-md transition-opacity hover:opacity-50" />
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-semibold leading-tight text-foreground">
              {CLINIC_NAME.split(" ")[0]} <span className="text-rose-500">&</span> Smooth
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("nav.book") === "حجز" ? "ليزر وتجميل" : "Laser & Beauty Clinic"}
            </div>
          </div>
        </button>

        {/* Desktop nav with animated underline */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = currentRoute.name === link.route.name
            return (
              <button
                key={link.labelKey}
                onClick={() => navigate(link.route)}
                data-active={isActive}
                className={`nav-underline relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-rose-600"
                    : "text-foreground/80 hover:text-rose-600"
                }`}
              >
                {t(link.labelKey)}
              </button>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ name: "cart" })}
            className="relative transition-transform hover:scale-105"
            aria-label={t("nav.cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-scale-in items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Button>

          {/* Mobile icon-only Book Now */}
          <Button
            size="icon"
            onClick={() => navigate({ name: "booking" })}
            className="h-10 w-10 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 sm:hidden"
            aria-label={t("nav.bookNow")}
          >
            <Calendar className="h-4 w-4" />
          </Button>

          {/* Desktop Book Now */}
          <Button
            size="sm"
            onClick={() => navigate({ name: "booking" })}
            className="btn-shimmer hidden bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 sm:inline-flex"
          >
            <Calendar className="mr-1.5 h-4 w-4" />
            {t("nav.bookNow")}
          </Button>

          {/* Mobile menu - modern 2026 redesign */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("nav.openMenu")}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm border-0 p-0">
              <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>

              {/* Branded gradient header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 px-6 pb-6 pt-8 text-white">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-bold leading-tight">
                        {CLINIC_NAME.split(" ")[0]} <span className="text-rose-200">&</span> Smooth
                      </div>
                      <div className="text-[10px] font-medium uppercase tracking-wider text-rose-100/80">
                        {t("nav.book") === "حجز" ? "ليزر وتجميل" : "Laser & Beauty Clinic"}
                      </div>
                    </div>
                  </div>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      aria-label={t("nav.closeMenu")}
                    >
                      <span className="text-lg leading-none">×</span>
                    </Button>
                  </SheetClose>
                </div>

                {/* Mini stats row */}
                <div className="relative mt-5 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-rose-50">{t("mobileMenu.openToday")}</span>
                  </div>
                  <div className="h-3 w-px bg-white/20" />
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold">
                      4.9
                    </div>
                    <span className="text-rose-50">{t("mobileMenu.clients")}</span>
                  </div>
                </div>
              </div>

              {/* Scrollable nav body */}
              <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
                {/* Nav items - modern card style with icons */}
                <div className="space-y-1.5">
                  {NAV_LINKS.map((link) => {
                    const isActive = currentRoute.name === link.route.name
                    return (
                      <SheetClose asChild key={link.labelKey}>
                        <button
                          onClick={() => navigate(link.route)}
                          className={`group flex w-full items-center gap-3 rounded-2xl p-3 transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-rose-50 to-rose-50/50 ring-1 ring-rose-200"
                              : "hover:bg-muted/60"
                          }`}
                        >
                          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
                            isActive
                              ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm shadow-rose-500/30"
                              : "bg-muted text-muted-foreground group-hover:bg-rose-100 group-hover:text-rose-600"
                          }`}>
                            <link.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0 text-start">
                            <div className={`text-sm font-semibold ${
                              isActive ? "text-rose-700" : "text-foreground"
                            }`}>
                              {t(link.labelKey)}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {t(link.descKey)}
                            </div>
                          </div>
                          <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform ${
                            isActive ? "text-rose-400" : "text-muted-foreground/40 group-hover:translate-x-0.5"
                          }`} />
                        </button>
                      </SheetClose>
                    )
                  })}
                </div>

                {/* Primary CTA */}
                <div className="mt-5">
                  <SheetClose asChild>
                    <Button
                      className="btn-shimmer h-12 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-base font-semibold shadow-md shadow-rose-500/25 hover:from-rose-600 hover:to-rose-700"
                      onClick={() => navigate({ name: "booking" })}
                    >
                      <CalendarCheck className="mr-2 h-5 w-5" />
                      {t("nav.bookAppointment")}
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="mt-1.5 h-10 w-full text-xs text-muted-foreground hover:text-rose-600"
                      onClick={() => navigate({ name: "admin_login" })}
                    >
                      <Shield className="mr-1.5 h-3.5 w-3.5" />
                      {t("nav.adminLogin")}
                    </Button>
                  </SheetClose>
                </div>

                {/* Contact cards */}
                <div className="mt-6">
                  <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {t("footer.contact")}
                  </div>
                  <div className="space-y-1.5">
                    <a
                      href={`tel:${CLINIC_PHONE.replace(/[^\d+]/g, "")}`}
                      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-rose-200 hover:bg-rose-50/50"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("mobileMenu.callUs")}</div>
                        <div className="truncate text-sm font-medium">{CLINIC_PHONE}</div>
                      </div>
                    </a>
                    <a
                      href={`mailto:${CLINIC_EMAIL}`}
                      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-rose-200 hover:bg-rose-50/50"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("mobileMenu.emailLabel")}</div>
                        <div className="truncate text-sm font-medium">{CLINIC_EMAIL}</div>
                      </div>
                    </a>
                    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("mobileMenu.visit")}</div>
                        <div className="truncate text-sm font-medium">{CLINIC_ADDRESS}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social + copyright */}
                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-5">
                  <div className="flex gap-2">
                    <a
                      href="#"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-rose-100 hover:text-rose-600 hover:scale-110"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                    <a
                      href="#"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-rose-100 hover:text-rose-600 hover:scale-110"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="text-[10px] text-muted-foreground/60">
                    © {new Date().getFullYear()} {CLINIC_NAME.split(" ")[0]}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
