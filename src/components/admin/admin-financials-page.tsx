"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"
import { formatMoney, formatDateTime } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts"
import { Receipt, TrendingUp, Clock, CheckCircle2, XCircle, DollarSign } from "lucide-react"

interface FinancialData {
  range: { start: string; end: string }
  total: number
  pending: number
  cancelled: number
  byType: Record<string, { completed: number; pending: number; count: number }>
  series: { date: string; label: string; total: number }[]
  transactions: {
    id: string
    type: string
    amount: number
    status: string
    description: string | null
    refId: string | null
    createdAt: string
  }[]
}

export function AdminFinancialsPage() {
  const [range, setRange] = useState("month")

  const { data, isLoading } = useQuery({
    queryKey: ["financials", range],
    queryFn: () => apiGet<FinancialData>(`/api/financials?range=${range}`),
  })

  const fmt = formatMoney
  const f = data

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financials</h1>
          <p className="text-sm text-muted-foreground">
            Track revenue across services and products.
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading || !f ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 shimmer rounded-lg" />
            ))}
          </div>
          <div className="h-64 shimmer rounded-lg" />
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="card-hover relative overflow-hidden">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-emerald-500/5 blur-2xl" />
              <CardContent className="relative p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Total Revenue
                    </div>
                    <div className="mt-1 text-2xl font-bold text-emerald-600">
                      {fmt(f.total)}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover relative overflow-hidden">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-amber-500/5 blur-2xl" />
              <CardContent className="relative p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Pending
                    </div>
                    <div className="mt-1 text-2xl font-bold text-amber-600">
                      {fmt(f.pending)}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover relative overflow-hidden">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-rose-500/5 blur-2xl" />
              <CardContent className="relative p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Cancelled
                    </div>
                    <div className="mt-1 text-2xl font-bold text-rose-600">
                      {fmt(f.cancelled)}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 ring-1 ring-rose-100">
                    <XCircle className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover relative overflow-hidden">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-rose-500/5 blur-2xl" />
              <CardContent className="relative p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Net Collected
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                      {fmt(f.total)}
                    </div>
                    <div className="mt-0.5 text-xs text-emerald-600">
                      {f.pending > 0 ? `${fmt(f.pending)} pending` : "All collected"}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 ring-1 ring-rose-100">
                    <TrendingUp className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                {new Date(f.range.start).toLocaleDateString()} – {new Date(f.range.end).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {f.series.every((s) => s.total === 0) ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  No revenue in this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={f.series}>
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
                      formatter={(v: number) => [fmt(v), "Revenue"]}
                    />
                    <Area type="monotone" dataKey="total" stroke="oklch(0.62 0.18 350)" strokeWidth={2} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Breakdown by type */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>By transaction type</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(f.byType).length === 0 ? (
                  <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                    No data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={
                      Object.entries(f.byType).map(([k, v]) => ({
                        name: k.charAt(0) + k.slice(1).toLowerCase(),
                        Completed: v.completed,
                        Pending: v.pending,
                      }))
                    }>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 60)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Completed" fill="oklch(0.65 0.20 350)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Pending" fill="oklch(0.78 0.16 80)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>By transaction type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(f.byType).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">{k.charAt(0) + k.slice(1).toLowerCase()}</div>
                        <div className="text-xs text-muted-foreground">{v.count} transactions</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600">{fmt(v.completed)}</div>
                        {v.pending > 0 && (
                          <div className="text-xs text-amber-600">{fmt(v.pending)} pending</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest 100 transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {f.transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(t.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{t.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{t.description || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              t.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : t.status === "CANCELLED"
                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {fmt(t.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
