// Admin auth store - mirrors server session via /api/auth/me
import { create } from "zustand"

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  admin: AdminUser | null
  loading: boolean
  loaded: boolean
  fetchMe: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  admin: null,
  loading: false,
  loaded: false,
  fetchMe: async () => {
    set({ loading: true })
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        set({ admin: data.admin, loading: false, loaded: true })
      } else {
        set({ admin: null, loading: false, loaded: true })
      }
    } catch {
      set({ admin: null, loading: false, loaded: true })
    }
  },
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    set({ admin: null })
  },
}))
