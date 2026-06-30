"use client"

import { useNav } from "@/store/nav"
import { useCart } from "@/store/cart"
import { CLINIC_NAME } from "@/lib/constants"
import {
  Sparkles, Menu, ShoppingCart, Calendar, Phone, MapPin,
  Instagram, Facebook, Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose,
} from "@/components/ui/sheet"
import { useState } from "react"

const NAV_LINKS: { label: string; route: Parameters<ReturnType<typeof useNav>["navigate"]>[0] }[] = [
  { label: "Home", route: { name: "home" } },
  { label: "Services", route: { name: "services" } },
  { label: "Book", route: { name: "booking" } },
  { label: "Shop", route: { name: "shop" } },
  { label: "Contact", route: { name: "contact" } },
]

export function CustomerHeader() {
  const navigate = useNav((s) => s.navigate)
  const currentRoute = useNav((s) => s.route)
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => navigate({ name: "home" })}
          className="flex items-center gap-2 transition-transform hover:scale-[1.02]"
          aria-label="Home"
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
              Laser & Beauty Clinic
            </div>
          </div>
        </button>

        {/* Desktop nav with animated underline */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = currentRoute.name === link.route.name
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.route)}
                data-active={isActive}
                className={`nav-underline relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-rose-600"
                    : "text-foreground/80 hover:text-rose-600"
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ name: "cart" })}
            className="relative transition-transform hover:scale-105"
            aria-label={`Cart${cartCount > 0 ? ` with ${cartCount} items` : ""}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-scale-in items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Button>

          <Button
            size="sm"
            onClick={() => navigate({ name: "booking" })}
            className="btn-shimmer hidden bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 sm:inline-flex"
          >
            <Calendar className="mr-1.5 h-4 w-4" />
            Book Now
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.label}>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate(link.route)}
                    >
                      {link.label}
                    </Button>
                  </SheetClose>
                ))}
                <div className="my-2 h-px bg-border" />
                <SheetClose asChild>
                  <Button
                    className="btn-shimmer bg-gradient-to-r from-rose-500 to-rose-600"
                    onClick={() => navigate({ name: "booking" })}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    onClick={() => navigate({ name: "admin_login" })}
                  >
                    Admin Login
                  </Button>
                </SheetClose>
              </div>
              <div className="mt-8 space-y-3 border-t pt-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-rose-500" />
                  +1 (555) 123-4567
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 text-rose-500" />
                  hello@glowsmooth.clinic
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  123 Beauty Avenue, Beverly Hills
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
