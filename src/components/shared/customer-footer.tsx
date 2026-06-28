"use client"

import { useNav } from "@/store/nav"
import { CLINIC_NAME, CLINIC_PHONE, CLINIC_EMAIL, CLINIC_ADDRESS, CLINIC_HOURS } from "@/lib/constants"
import { Sparkles, Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react"

export function CustomerFooter() {
  const navigate = useNav((s) => s.navigate)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/60 bg-gradient-to-b from-background to-rose-50/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold">{CLINIC_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium laser waxing and beauty treatments. Reveal your smoothest self in a relaxing,
              professional environment.
            </p>
            <div className="flex gap-2 pt-2">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 transition hover:bg-rose-200"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 transition hover:bg-rose-200"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate({ name: "services" })} className="transition hover:text-rose-600">
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => navigate({ name: "booking" })} className="transition hover:text-rose-600">
                  Book Appointment
                </button>
              </li>
              <li>
                <button onClick={() => navigate({ name: "shop" })} className="transition hover:text-rose-600">
                  Shop Products
                </button>
              </li>
              <li>
                <button onClick={() => navigate({ name: "contact" })} className="transition hover:text-rose-600">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                <span>{CLINIC_PHONE}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                <span>{CLINIC_EMAIL}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                <span>{CLINIC_ADDRESS}</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Opening Hours
            </h4>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
              <span>{CLINIC_HOURS}</span>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              <strong>Closed Sundays</strong>
              <br />
              Book online 24/7
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} {CLINIC_NAME}. All rights reserved.</p>
          <div className="flex gap-4">
            <button onClick={() => navigate({ name: "admin_login" })} className="transition hover:text-rose-600">
              Admin Portal
            </button>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
