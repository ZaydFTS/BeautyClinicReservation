"use client"

import { useNav } from "@/store/nav"
import { useLang } from "@/store/lang"
import { useSiteSettings, getSettings } from "@/lib/site-settings"
import { Sparkles, X, ArrowRight } from "lucide-react"
import { useState } from "react"

export function PromoBanner() {
  const navigate = useNav((s) => s.navigate)
  const lang = useLang((s) => s.lang)
  const { data } = useSiteSettings()
  const s = getSettings(data?.settings)

  const [dismissed, setDismissed] = useState(false)

  if (s.promoEnabled !== "true" || dismissed) return null
  if (!s.promoText && !s.promoPercent) return null

  const text = lang === "ar" && s.promoTextAr ? s.promoTextAr : s.promoText
  const hasPercent = !!s.promoPercent

  const handleClick = () => {
    if (s.promoLink) {
      // Support hash links like "#/services"
      if (s.promoLink.startsWith("#")) {
        window.location.hash = s.promoLink.slice(1)
      } else {
        navigate({ name: "services" })
      }
    }
  }

  return (
    <div className="relative z-50 bg-secondary text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-10 top-0 h-8 w-32 rounded-full bg-primary-container/20 blur-2xl" />
        <div className="absolute -right-10 bottom-0 h-8 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>
      <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-center">
        <div className="flex items-center gap-2">
          {hasPercent && (
            <span className="inline-flex items-center rounded-full bg-primary-container px-2 py-0.5 text-xs font-bold text-secondary">
              -{s.promoPercent}%
            </span>
          )}
          {text && (
            <span className="text-xs font-semibold tracking-wide sm:text-sm">
              {text}
            </span>
          )}
        </div>
        {s.promoLink && (
          <button
            onClick={handleClick}
            className="press-feedback inline-flex items-center gap-1 text-xs font-bold underline-offset-2 hover:underline"
          >
            <span className="hidden sm:inline">Shop Now</span>
            <ArrowRight className="h-3 w-3 rtl:rotate-180" />
          </button>
        )}
        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="press-feedback absolute end-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
