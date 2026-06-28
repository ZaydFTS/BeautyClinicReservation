"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"
import { formatMoney, formatDateTime, formatTime } from "@/lib/format"
import {
  APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_COLOR,
  ORDER_STATUS_LABEL, ORDER_STATUS_COLOR,
} from "@/lib/constants"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Search, Users, Eye, Phone, Mail, Calendar, ShoppingBag, Clock } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  notes: string | null
  createdAt: string
  _count: { appointments: number; orders: number }
}

interface CustomerDetail extends Customer {
  appointments: {
    id: string
    status: string
    price: number
    service: { name: string }
    slot: { startTime: string }
  }[]
  orders: {
    id: string
    status: string
    total: number
    createdAt: string
    items: { id: string; name: string; quantity: number }[]
  }[]
}

export function AdminCustomersPage() {
  const [q, setQ] = useState("")
  const [viewId, setViewId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["customers", q],
    queryFn: () =>
      apiGet<{ customers: Customer[] }>(`/api/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  })

  const { data: detailData } = useQuery({
    queryKey: ["customer", viewId],
    queryFn: () => apiGet<{ customer: CustomerDetail }>(`/api/customers/${viewId}`),
    enabled: !!viewId,
  })

  const customers = data?.customers || []
  const detail = detailData?.customer

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          View customer profiles, booking history, and order history.
        </p>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-64 shimmer" />
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No customers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Appointments</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{c.email || "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{c._count.appointments}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{c._count.orders}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(c.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setViewId(c.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!viewId} onOpenChange={(o) => !o && setViewId(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
            <DialogDescription>
              {detail && `Member since ${formatDateTime(detail.createdAt)}`}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              {/* Contact */}
              <div className="rounded-lg bg-muted/30 p-4 space-y-2">
                <div className="text-lg font-bold">{detail.name}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-rose-500" />
                    {detail.phone}
                  </div>
                  {detail.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-rose-500" />
                      {detail.email}
                    </div>
                  )}
                </div>
                {detail.notes && (
                  <div className="border-t pt-2 text-sm">
                    <strong>Notes:</strong> {detail.notes}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border p-3 text-center">
                  <Calendar className="mx-auto h-5 w-5 text-rose-500" />
                  <div className="mt-1 text-xl font-bold">{detail.appointments.length}</div>
                  <div className="text-xs text-muted-foreground">Appointments</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <ShoppingBag className="mx-auto h-5 w-5 text-amber-500" />
                  <div className="mt-1 text-xl font-bold">{detail.orders.length}</div>
                  <div className="text-xs text-muted-foreground">Orders</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <Clock className="mx-auto h-5 w-5 text-emerald-500" />
                  <div className="mt-1 text-xl font-bold">
                    {formatMoney(
                      [...detail.appointments, ...detail.orders].reduce(
                        (s, x) => s + (x as { price?: number; total?: number }).price ||
                          (x as { total: number }).total || 0,
                        0
                      )
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Total spend</div>
                </div>
              </div>

              {/* Appointments */}
              <div>
                <div className="mb-2 text-sm font-semibold">Booking History</div>
                {detail.appointments.length === 0 ? (
                  <div className="rounded-md border border-dashed py-4 text-center text-xs text-muted-foreground">
                    No appointments yet
                  </div>
                ) : (
                  <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                    {detail.appointments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-md border p-2 text-xs">
                        <div>
                          <div className="font-medium">{a.service.name}</div>
                          <div className="text-muted-foreground">
                            {formatDateTime(a.slot.startTime)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatMoney(a.price)}</div>
                          <Badge className={APPOINTMENT_STATUS_COLOR[a.status]} variant="outline">
                            {APPOINTMENT_STATUS_LABEL[a.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Orders */}
              <div>
                <div className="mb-2 text-sm font-semibold">Order History</div>
                {detail.orders.length === 0 ? (
                  <div className="rounded-md border border-dashed py-4 text-center text-xs text-muted-foreground">
                    No orders yet
                  </div>
                ) : (
                  <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                    {detail.orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-md border p-2 text-xs">
                        <div>
                          <div className="font-mono">#{o.id.slice(-8).toUpperCase()}</div>
                          <div className="text-muted-foreground">
                            {formatDateTime(o.createdAt)} · {o.items.length} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatMoney(o.total)}</div>
                          <Badge className={ORDER_STATUS_COLOR[o.status]} variant="outline">
                            {ORDER_STATUS_LABEL[o.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
