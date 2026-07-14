// Language store — manages current language + direction (RTL/LTR)
// Persists to localStorage
//
// IMPORTANT: The `t` function is recreated whenever `lang` changes so that
// components selecting `s.t` re-render. This is necessary because Zustand
// uses Object.is to compare selected values — a stable function reference
// would never trigger a re-render.

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { type Language, getDir, translate } from "@/lib/i18n"

interface LanguageState {
  lang: Language
  dir: "ltr" | "rtl"
  setLang: (lang: Language) => void
  toggle: () => void
  // t is recreated on every lang change to trigger re-renders
  t: (key: string, params?: Record<string, string | number>) => string
}

function makeT(lang: Language) {
  return (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params)
}

export const useLang = create<LanguageState>()(
  persist(
    (set, get) => ({
      lang: "en",
      dir: "ltr",
      setLang: (lang) => {
        const dir = getDir(lang)
        set({ lang, dir, t: makeT(lang) })
        if (typeof document !== "undefined") {
          document.documentElement.lang = lang
          document.documentElement.dir = dir
        }
      },
      toggle: () => {
        const next = get().lang === "en" ? "ar" : "en"
        get().setLang(next)
      },
      t: makeT("en"),
    }),
    {
      name: "bc_lang",
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recreate t function with rehydrated lang
          state.t = makeT(state.lang)
          if (typeof document !== "undefined") {
            document.documentElement.lang = state.lang
            document.documentElement.dir = state.dir
          }
        }
      },
    }
  )
)
