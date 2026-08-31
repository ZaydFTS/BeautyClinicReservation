"use client"

import { useNav } from"@/store/nav"
import { useCart } from"@/store/cart"
import { useLang } from"@/store/lang"
import { CLINIC_NAME, CLINIC_PHONE, CLINIC_EMAIL, CLINIC_ADDRESS } from"@/lib/constants"
import {
 Sparkles, Menu, ShoppingCart, Calendar, Phone, MapPin,
 Instagram, Facebook, Mail, Home, Scissors, CalendarCheck,
 ShoppingBag, MessageCircle, ChevronRight, Clock,
} from "lucide-react"
import { Button } from"@/components/ui/button"
import { Badge } from"@/components/ui/badge"
import {
 Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose,
} from"@/components/ui/sheet"
import { LanguageSwitcher } from"@/components/shared/language-switcher"
import { useState } from"react"

const NAV_LINKS: {
 labelKey: string
 route: Parameters<ReturnType<typeof useNav>["navigate"]>[0]
 icon: typeof Home
 descKey: string
}[] = [
 { labelKey:"nav.home", route: { name:"home" }, icon: Home, descKey:"mobileMenu.homeDesc" },
 { labelKey:"nav.services", route: { name:"services" }, icon: Scissors, descKey:"mobileMenu.servicesDesc" },
 { labelKey:"nav.book", route: { name:"booking" }, icon: CalendarCheck, descKey:"mobileMenu.bookDesc" },
 { labelKey:"nav.shop", route: { name:"shop" }, icon: ShoppingBag, descKey:"mobileMenu.shopDesc" },
 { labelKey:"nav.contact", route: { name:"contact" }, icon: MessageCircle, descKey:"mobileMenu.contactDesc" },
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
 onClick={() => navigate({ name:"home" })}
 className="flex items-center gap-2 transition-transform hover:scale-[1.02]"
 aria-label={t("nav.home")}
 >
 <img src="/logo.png" alt="Glow Beauty Clinic" className="h-10 w-10 rounded-full object-cover" />
 <div className="hidden sm:block">
 <div className="font-serif text-lg font-bold leading-tight text-foreground">
 Glow Beauty Clinic
 </div>
 <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
 {t("nav.book") ==="حجز" ?"ليزر وتجميل" :"Beauty & Laser Clinic"}
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
 ?"text-primary"
 :"text-foreground/80 hover:text-primary"
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
 onClick={() => navigate({ name:"cart" })}
 className="relative transition-transform hover:scale-105"
 aria-label={t("nav.cart")}
 >
 <ShoppingCart className="h-5 w-5" />
 {cartCount > 0 && (
 <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-scale-in items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-sm">
 {cartCount}
 </span>
 )}
 </Button>

 {/* Mobile icon-only Book Now */}
 <Button
 size="icon"
 onClick={() => navigate({ name:"booking" })}
 className="h-10 w-10 bg-primary"
 aria-label={t("nav.bookNow")}
 >
 <Calendar className="h-4 w-4" />
 </Button>

 {/* Desktop Book Now */}
 <Button
 size="sm"
 onClick={() => navigate({ name:"booking" })}
 className="btn-shimmer hidden bg-primary"
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
 <SheetContent side="right" className="hide-auto-close w-[88vw] max-w-sm border-0 bg-white p-0">
 <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>

 {/* Top bar — close button only, clean white */}
 <div className="flex items-center justify-end p-5">
 <SheetClose asChild>
 <button
 className="press-feedback flex h-10 w-10 items-center justify-center rounded-full bg-blush text-secondary transition-all hover:bg-primary hover:text-white"
 aria-label={t("nav.closeMenu")}
 >
 <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </SheetClose>
 </div>

 {/* Scrollable body */}
 <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6">
 {/* Navigation items — serif font, icon in soft lavender box */}
 <div className="space-y-1">
 {NAV_LINKS.map((link) => {
 const isActive = currentRoute.name === link.route.name
 return (
 <SheetClose asChild key={link.labelKey}>
 <button
 onClick={() => navigate(link.route)}
 className={`press-feedback group flex w-full items-center gap-4 rounded-2xl py-3 transition-all ${
 isActive ? "bg-blush" : "hover:bg-blush/50"
 }`}
 >
 <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
 isActive
 ? "bg-primary text-white"
 : "bg-blush text-primary group-hover:bg-primary group-hover:text-white"
 }`}>
 <link.icon className="h-5 w-5" strokeWidth={1.5} />
 </div>
 <span className={`font-serif text-2xl tracking-tight transition-colors ${
 isActive ? "text-primary" : "text-foreground group-hover:text-primary"
 }`}>
 {t(link.labelKey)}
 </span>
 </button>
 </SheetClose>
 )
 })}
 </div>

 {/* CTA button */}
 <div className="mt-8">
 <SheetClose asChild>
 <Button
 className="btn-press h-13 w-full rounded-2xl bg-primary text-base font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90"
 onClick={() => navigate({ name: "booking" })}
 >
 <CalendarCheck className="mr-2 h-5 w-5" strokeWidth={1.5} />
 {t("nav.bookAppointment")}
 </Button>
 </SheetClose>
 </div>

 {/* Spacer to push contact to bottom */}
 <div className="flex-1" />

 {/* Contact info — pinned to bottom */}
 <div className="mt-8 space-y-3">
 <div className="flex items-center gap-3 text-sm text-muted-foreground">
 <MapPin className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={1.5} />
 <span>{CLINIC_ADDRESS}</span>
 </div>
 <div className="flex items-center gap-3 text-sm text-muted-foreground">
 <Phone className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={1.5} />
 <span>{CLINIC_PHONE}</span>
 </div>
 </div>

 {/* Social icons */}
 <div className="mt-6 flex gap-3">
 <a
 href="#"
 className="press-feedback flex h-10 w-10 items-center justify-center rounded-xl bg-blush text-primary transition-all hover:bg-primary hover:text-white"
 aria-label="Instagram"
 >
 <Instagram className="h-4 w-4" strokeWidth={1.5} />
 </a>
 <a
 href="#"
 className="press-feedback flex h-10 w-10 items-center justify-center rounded-xl bg-blush text-primary transition-all hover:bg-primary hover:text-white"
 aria-label="Facebook"
 >
 <Facebook className="h-4 w-4" strokeWidth={1.5} />
 </a>
 <a
 href="#"
 className="press-feedback flex h-10 w-10 items-center justify-center rounded-xl bg-blush text-primary transition-all hover:bg-primary hover:text-white"
 aria-label="Twitter"
 >
 <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
 </a>
 </div>

 {/* Copyright */}
 <div className="mt-4 text-xs text-muted-foreground/60">
 © {new Date().getFullYear()} {CLINIC_NAME}
 </div>
 </div>
 </SheetContent>
 </Sheet>
 </div>
 </div>
 </header>
 )
}
