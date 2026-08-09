"use client"

import { useLang } from"@/store/lang"
import { LANGUAGES } from"@/lib/i18n"
import { Button } from"@/components/ui/button"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu"
import { Languages, Check } from"lucide-react"

export function LanguageSwitcher({ variant ="ghost" }: { variant?:"ghost" |"outline" }) {
 const lang = useLang((s) => s.lang)
 const setLang = useLang((s) => s.setLang)

 return (
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button
 variant={variant}
 size="sm"
 className="gap-1.5 px-2.5"
 aria-label="Switch language"
 >
 <Languages className="h-4 w-4" />
 <span className="text-xs font-semibold uppercase">{lang}</span>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="min-w-[140px]">
 {LANGUAGES.map((l) => (
 <DropdownMenuItem
 key={l.code}
 onClick={() => setLang(l.code)}
 className="flex items-center justify-between gap-2"
 >
 <div className="flex flex-col">
 <span className="font-medium">{l.nativeLabel}</span>
 <span className="text-xs text-muted-foreground">{l.label}</span>
 </div>
 {lang === l.code && <Check className="h-4 w-4 text-primary" />}
 </DropdownMenuItem>
 ))}
 </DropdownMenuContent>
 </DropdownMenu>
 )
}
