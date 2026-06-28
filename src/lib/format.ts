// Money + date formatting helpers

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(date)
}

export function formatTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "short",
  }).format(date)
}

export function toISODate(d: Date): string {
  // YYYY-MM-DD
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function startOfWeek(d: Date): Date {
  const x = startOfDay(d)
  const day = x.getDay() // 0 = Sunday
  const diff = (day + 6) % 7 // make Monday the first day
  x.setDate(x.getDate() - diff)
  return x
}

export function endOfWeek(d: Date): Date {
  const s = startOfWeek(d)
  const e = new Date(s)
  e.setDate(e.getDate() + 7)
  e.setMilliseconds(-1)
  return e
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function addMinutes(d: Date, n: number): Date {
  const x = new Date(d)
  x.setMinutes(x.getMinutes() + n)
  return x
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function generateId(prefix = ""): string {
  return prefix + Math.random().toString(36).slice(2, 10)
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function safeNumber(v: unknown, fallback = 0): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number)
  if (typeof n !== "number" || Number.isNaN(n)) return fallback
  return n
}

export function safeJsonParse<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback
  try {
    return JSON.parse(s) as T
  } catch {
    return fallback
  }
}
