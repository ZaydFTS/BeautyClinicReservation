// Shopping cart store - persisted to localStorage

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  productId: string
  name: string
  price: number
  imageUrl?: string | null
  quantity: number
  stock: number
  categoryId?: string | null
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clear: () => void
  setOpen: (v: boolean) => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item, qty = 1) => {
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId)
          if (existing) {
            const newQty = Math.min(existing.quantity + qty, item.stock)
            return {
              items: s.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: newQty }
                  : i
              ),
              isOpen: true,
            }
          }
          return {
            items: [...s.items, { ...item, quantity: Math.min(qty, item.stock) }],
            isOpen: true,
          }
        })
      },
      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      updateQty: (productId, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
      setOpen: (v) => set({ isOpen: v }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "bc_cart" }
  )
)
