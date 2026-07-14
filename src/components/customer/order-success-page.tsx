"use client"

import { useQuery } from "@tanstack/react-query"
import { useNav, type Route } from "@/store/nav"
import { useLang } from "@/store/lang"
import { apiGet } from "@/lib/api-client"
import { formatMoney, formatDateTime } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Package, Calendar, ShoppingBag, Home } from "lucide-react"

interface Order {
  id: string
  status: string
  total: number
  paymentMethod: string
  createdAt: string
  items: { id: string; name: string; quantity: number; price: number; total: number }[]
}

export function OrderSuccessPage({ route }: { route: Extract<Route, { name: "order_success" }> }) {
  const navigate = useNav((s) => s.navigate)
  const t = useLang((s) => s.t)
  const { data } = useQuery({
    queryKey: ["order", route.orderId],
    queryFn: () => apiGet<{ order: Order }>(`/api/orders/${route.orderId}`),
  })
  const order = data?.order

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-50 to-rose-50 p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">{t("orderSuccess.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("orderSuccess.desc")}
          </p>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{t("orderSuccess.orderNumber")}</div>
            <div className="mt-1 font-mono text-lg font-bold">
              #{order?.id?.slice(-8).toUpperCase() || "PENDING"}
            </div>
            {order && (
              <div className="mt-1 text-xs text-muted-foreground">
                {t("orderSuccess.placed")} {formatDateTime(order.createdAt)}
              </div>
            )}
          </div>

          {order && (
            <>
              <div>
                <div className="mb-2 text-sm font-semibold">{t("orderSuccess.items")}</div>
                <div className="space-y-2">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-sm">
                      <span className="flex-1">
                        <span className="font-medium">{it.name}</span>
                        <span className="ms-1 text-muted-foreground">× {it.quantity}</span>
                      </span>
                      <span className="font-medium">{formatMoney(it.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">{t("orderSuccess.total")}</span>
                <span className="text-lg font-bold text-rose-600">{formatMoney(order.total)}</span>
              </div>

              <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                <strong>{t("orderSuccess.payment")}:</strong>{" "}
                {order.paymentMethod === "CASH_IN_CLINIC"
                  ? t("orderSuccess.payInClinic")
                  : t("orderSuccess.cod")}
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate({ name: "shop" })}
            >
              <ShoppingBag className="me-2 h-4 w-4" />
              {t("orderSuccess.continueShopping")}
            </Button>
            <Button
              className="flex-1 bg-rose-500 hover:bg-rose-600"
              onClick={() => navigate({ name: "booking" })}
            >
              <Calendar className="me-2 h-4 w-4" />
              {t("orderSuccess.bookAppointment")}
            </Button>
          </div>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate({ name: "home" })}
          >
            <Home className="me-2 h-4 w-4" />
            {t("orderSuccess.backToHome")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
