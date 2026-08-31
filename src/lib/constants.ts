// Beauty Clinic - shared constants and types

export const CLINIC_NAME ="Glow & Smooth Laser Clinic"
export const CLINIC_TAGLINE ="Premium Laser Waxing & Beauty Care"
export const CLINIC_PHONE ="+972 595718422"
export const CLINIC_EMAIL ="hello@glowsmooth.clinic"
export const CLINIC_ADDRESS ="Nablus - Haifa Street - Near Jamal Abdul Naser Park"
export const CLINIC_HOURS ="Sat–Thu: 8:00 AM – 5:00 PM · Fri: Closed"

export const APPOINTMENT_STATUS = {
 BOOKED:"BOOKED",
 COMPLETED:"COMPLETED",
 CANCELLED:"CANCELLED",
 NO_SHOW:"NO_SHOW",
} as const

export const ORDER_STATUS = {
 PENDING:"PENDING",
 COMPLETED:"COMPLETED",
 CANCELLED:"CANCELLED",
} as const

export const SLOT_STATUS = {
 AVAILABLE:"AVAILABLE",
 BLOCKED:"BLOCKED",
 HOLIDAY:"HOLIDAY",
} as const

export const PAYMENT_METHOD = {
 CASH_IN_CLINIC:"CASH_IN_CLINIC",
 COD:"COD",
} as const

export const SERVICE_CATEGORIES = ["Waxing","Laser","Skincare","Other",
] as const

export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS
export type OrderStatus = keyof typeof ORDER_STATUS
export type SlotStatus = keyof typeof SLOT_STATUS
export type PaymentMethod = keyof typeof PAYMENT_METHOD

export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
 BOOKED:"Booked",
 COMPLETED:"Completed",
 CANCELLED:"Cancelled",
 NO_SHOW:"No-Show",
}

export const APPOINTMENT_STATUS_COLOR: Record<string, string> = {
 BOOKED:"bg-blush-strong text-secondary border-outline-variant",
 COMPLETED:"bg-blush text-primary border-outline-variant",
 CANCELLED:"bg-blush text-secondary border-outline-variant",
 NO_SHOW:"bg-slate-200 text-slate-700 border-slate-300",
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
 PENDING:"Pending",
 COMPLETED:"Completed",
 CANCELLED:"Cancelled",
}

export const ORDER_STATUS_COLOR: Record<string, string> = {
 PENDING:"bg-blush-strong text-secondary border-outline-variant",
 COMPLETED:"bg-blush text-primary border-outline-variant",
 CANCELLED:"bg-blush text-secondary border-outline-variant",
}

export const SLOT_STATUS_LABEL: Record<string, string> = {
 AVAILABLE:"Available",
 BLOCKED:"Blocked",
 HOLIDAY:"Holiday",
}

export const SLOT_STATUS_COLOR: Record<string, string> = {
 AVAILABLE:"bg-blush text-primary border-outline-variant",
 BLOCKED:"bg-blush text-secondary border-outline-variant",
 HOLIDAY:"bg-slate-100 text-slate-600 border-slate-200",
}

// Default admin credentials (seeded into DB)
export const DEFAULT_ADMIN = {
 email:"admin@glowsmooth.clinic",
 password:"admin123",
 name:"Clinic Admin",
}
