"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"
import { formatMoney, formatTime, formatDateTime } from "@/lib/format"
import {
  APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_COLOR,
  ORDER_STATUS_LABEL, ORDER_STATUS_COLOR,
} from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp, TrendingDown, DollarSign, Calendar as CalIcon,
  ShoppingBag, Package, AlertTriangle, ArrowRight, Clock, Users,
} from "lucide-react"
import { useNav } from "@/store/nav"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts"

interface DashboardData {
  todayAppointments: {
    id: string
    status: string
    price: number
    customer: { name: string; phone: string }
    service: { name: string }
    slot: { startTime: string; endTime: string }
  }[]
  todayOrders: {
    id: string
    status: string
    total: number
    customerName: string
    items: { id: string; name: string; quantity: number }[]
    createdAt: string
  }[]
  revenue: {
    today: number
    yesterday: number
    month: number
    pending: number
    deltaTodayVsYesterday: number
  }
  last7Series: { date: string; label: string; total: number }[]
  lowStock: {
    id: string
    name: string
    stock: number
    lowStockAt: number
    price: number
  }[]
  serviceBreakdown: { name: string; total: number; count: number }[]
  counts: {
    customers: number
    appointments: number
    orders: number
    products: number
  }
}

const PIE_COLORS = ["oklch(0.65 0.20 350)", "oklch(0.72 0.15 50)", "oklch(0.55 0.13 160)", "oklch(0.78 0.16 80)", "oklch(0.50 0.20 310)"]

export function AdminDashboardPage() {
  const navigate = useNav((s) => s.navigate)
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiGet<DashboardData>("/api/dashboard"),
    refetchInterval: 30000,
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 shimmer rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 shimmer rounded-lg" />
          ))}
        </div>
        <div className="h-64 shimmer rounded-lg" />
      </div>
    )
  }

  const revenueUp = data.revenue.deltaTodayVsYesterday >= 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Today&apos;s Revenue
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {formatMoney(data.revenue.today)}
                </div>
                <div className={`mt-1 flex items-center gap-1 text-xs ${revenueUp ? "text-emerald-600" : "text-rose-600"}`}>
                  {revenueUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(data.revenue.deltaTodayVsYesterday).toFixed(1)}% vs yesterday
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Month Revenue
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {formatMoney(data.revenue.month)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                  <Clock className="h-3 w-3" />
                  Pending: {formatMoney(data.revenue.pending)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50">
                <TrendingUp className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Today&apos;s Appointments
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {data.todayAppointments.length}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {data.todayAppointments.filter((a) => a.status === "COMPLETED").length} completed
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50">
                <CalIcon className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Today&apos;s Orders
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {data.todayOrders.length}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {data.todayOrders.reduce((s, o) => s + o.items.length, 0)} items sold
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <ShoppingBag className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days)</CardTitle>
            <CardDescription>Daily completed revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.last7Series}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.20 350)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.65 0.20 350)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 60)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="oklch(0.55 0.02 350)" />
                <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.55 0.02 350)" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.01 60)", borderRadius: 8 }}
                  formatter={(v: number) => [formatMoney(v), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="oklch(0.62 0.18 350)"
                  strokeWidth={2}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Service Revenue</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            {data.serviceBreakdown.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.serviceBreakdown}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {data.serviceBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatMoney(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's appointments + low stock */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Today's appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today&apos;s Appointments</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin_calendar" })}>
                View calendar
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.todayAppointments.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No appointments today
              </div>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {data.todayAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center gap-3 rounded-lg border p-3 transition hover:bg-muted/30"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-rose-50 text-rose-700">
                      <div className="text-[10px] uppercase">
                        {new Date(appt.slot.startTime).toLocaleDateString("en-US", { month: "short" })}
                      </div>
                      <div className="text-sm font-bold">
                        {new Date(appt.slot.startTime).getDate()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{appt.service.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {appt.customer.name} · {formatTime(appt.slot.startTime)}
                      </div>
                    </div>
                    <Badge className={APPOINTMENT_STATUS_COLOR[appt.status]} variant="outline">
                      {APPOINTMENT_STATUS_LABEL[appt.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Low Stock Alerts
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin_products" })}>
                Manage
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.lowStock.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                <Package className="mr-2 h-5 w-5" />
                All products well-stocked
              </div>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {data.lowStock.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Threshold: {p.lowStockAt}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {p.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today&apos;s Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin_orders" })}>
              All orders
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.todayOrders.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No orders today
            </div>
          ) : (
            <div className="space-y-2">
              {data.todayOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 rounded-lg border p-3 transition hover:bg-muted/30"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">
                      #{order.id.slice(-8).toUpperCase()} · {order.customerName}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {order.items.length} items · {formatDateTime(order.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatMoney(order.total)}</div>
                    <Badge className={ORDER_STATUS_COLOR[order.status]} variant="outline">
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Counts */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Customers", value: data.counts.customers, icon: Users, color: "text-rose-600" },
          { label: "Appointments", value: data.counts.appointments, icon: CalIcon, color: "text-emerald-600" },
          { label: "Orders", value: data.counts.orders, icon: ShoppingBag, color: "text-amber-600" },
          { label: "Products", value: data.counts.products, icon: Package, color: "text-purple-600" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <item.icon className={`h-8 w-8 ${item.color}`} />
              <div>
                <div className="text-xl font-bold">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
