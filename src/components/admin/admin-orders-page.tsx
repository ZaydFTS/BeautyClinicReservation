"use client"

import { useState } from"react"
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query"
import { apiGet, apiPatch, apiDelete } from"@/lib/api-client"
import { formatMoney, formatDateTime } from"@/lib/format"
import { ORDER_STATUS, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from"@/lib/constants"
import { Card, CardContent } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Badge } from"@/components/ui/badge"
import { Input } from"@/components/ui/input"
import {
 Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from"@/components/ui/select"
import {
 Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from"@/components/ui/table"
import {
 Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from"@/components/ui/dialog"
import {
 AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
 AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from"@/components/ui/alert-dialog"
import { Search, ShoppingCart, Eye, Trash2, CheckCircle2, XCircle, Clock } from"lucide-react"
import { toast } from"sonner"

interface OrderItem {
 id: string
 productId: string
 name: string
 price: number
 quantity: number
 total: number
}

interface Order {
 id: string
 status: string
 paymentMethod: string
 subtotal: number
 total: number
 customerName: string
 customerPhone: string
 customerEmail: string | null
 address: string | null
 notes: string | null
 createdAt: string
 items: OrderItem[]
}

export function AdminOrdersPage() {
 const queryClient = useQueryClient()
 const [q, setQ] = useState("")
 const [status, setStatus] = useState("all")
 const [viewOrder, setViewOrder] = useState<Order | null>(null)
 const [cancelOrder, setCancelOrder] = useState<Order | null>(null)

 const { data, isLoading } = useQuery({
 queryKey: ["orders", status],
 queryFn: () =>
 apiGet<{ orders: Order[] }>(
 `/api/orders${status !=="all" ? `?status=${status}` :""}`
 ),
 })

 const orders = (data?.orders || []).filter(
 (o) => !q ||
 o.customerName.toLowerCase().includes(q.toLowerCase()) ||
 o.customerPhone.includes(q) ||
 o.id.toLowerCase().includes(q.toLowerCase())
 )

 const statusMutation = useMutation({
 mutationFn: ({ id, status }: { id: string; status: string }) =>
 apiPatch(`/api/orders/${id}/status`, { status }),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["orders"] })
 queryClient.invalidateQueries({ queryKey: ["dashboard"] })
 toast.success("Order status updated")
 setViewOrder(null)
 },
 onError: (err: Error) => toast.error(err.message),
 })

 const cancelMutation = useMutation({
 mutationFn: (id: string) => apiDelete(`/api/orders/${id}`),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["orders"] })
 queryClient.invalidateQueries({ queryKey: ["dashboard"] })
 toast.success("Order cancelled")
 setCancelOrder(null)
 setViewOrder(null)
 },
 onError: (err: Error) => toast.error(err.message),
 })

 return (
 <div className="space-y-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
 <p className="text-sm text-muted-foreground">
 Manage customer orders. Stock auto-updates on completion.
 </p>
 </div>

 <div className="flex flex-wrap gap-2">
 <div className="relative flex-1 min-w-48">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search by name, phone, or order #..."
 value={q}
 onChange={(e) => setQ(e.target.value)}
 className="pl-9"
 />
 </div>
 <Select value={status} onValueChange={setStatus}>
 <SelectTrigger className="w-40">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All statuses</SelectItem>
 <SelectItem value="PENDING">Pending</SelectItem>
 <SelectItem value="COMPLETED">Completed</SelectItem>
 <SelectItem value="CANCELLED">Cancelled</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <Card>
 <CardContent className="p-0">
 {isLoading ? (
 <div className="h-64 shimmer" />
 ) : orders.length === 0 ? (
 <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
 <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
 <div className="absolute inset-0 rounded-full bg-blush-strong/40 blur-xl" aria-hidden />
 <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 ring-1 ring-primary/15 shadow-sm">
 <ShoppingCart className="h-6 w-6 text-primary" />
 </div>
 </div>
 <p className="mt-4 text-sm font-medium">No orders found</p>
 <p className="mt-1 text-xs text-muted-foreground">
 New customer orders will appear here in real time.
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Order #</TableHead>
 <TableHead>Customer</TableHead>
 <TableHead>Items</TableHead>
 <TableHead className="text-right">Total</TableHead>
 <TableHead>Payment</TableHead>
 <TableHead>Status</TableHead>
 <TableHead>Date</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {orders.map((o) => (
 <TableRow key={o.id}>
 <TableCell className="font-mono text-xs">
 #{o.id.slice(-8).toUpperCase()}
 </TableCell>
 <TableCell>
 <div className="font-medium">{o.customerName}</div>
 <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
 </TableCell>
 <TableCell>
 <Badge variant="secondary">{o.items.length} item(s)</Badge>
 </TableCell>
 <TableCell className="text-right font-bold">
 {formatMoney(o.total)}
 </TableCell>
 <TableCell>
 <span className="text-xs text-muted-foreground">
 {o.paymentMethod ==="CASH_IN_CLINIC" ?"In clinic" :"COD"}
 </span>
 </TableCell>
 <TableCell>
 <Badge className={ORDER_STATUS_COLOR[o.status]} variant="outline">
 {ORDER_STATUS_LABEL[o.status]}
 </Badge>
 </TableCell>
 <TableCell className="text-xs text-muted-foreground">
 {formatDateTime(o.createdAt)}
 </TableCell>
 <TableCell className="text-right">
 <Button
 variant="ghost"
 size="icon"
 className="h-9 w-9"
 onClick={() => setViewOrder(o)}
 aria-label="View order"
 >
 <Eye className="h-4 w-4" />
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

 {/* Order detail dialog */}
 <Dialog open={!!viewOrder} onOpenChange={(o) => !o && setViewOrder(null)}>
 <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle>Order #{viewOrder?.id.slice(-8).toUpperCase()}</DialogTitle>
 <DialogDescription>
 {viewOrder && formatDateTime(viewOrder.createdAt)}
 </DialogDescription>
 </DialogHeader>
 {viewOrder && (
 <div className="space-y-4">
 {/* Status */}
 <div className="flex items-center justify-between">
 <Badge className={ORDER_STATUS_COLOR[viewOrder.status]} variant="outline">
 {ORDER_STATUS_LABEL[viewOrder.status]}
 </Badge>
 <span className="text-lg font-bold text-primary">
 {formatMoney(viewOrder.total)}
 </span>
 </div>

 {/* Customer */}
 <div className="rounded-lg bg-muted/30 p-3 text-sm space-y-1">
 <div><strong>Customer:</strong> {viewOrder.customerName}</div>
 <div><strong>Phone:</strong> {viewOrder.customerPhone}</div>
 {viewOrder.customerEmail && (
 <div><strong>Email:</strong> {viewOrder.customerEmail}</div>
 )}
 {viewOrder.address && (
 <div><strong>Address:</strong> {viewOrder.address}</div>
 )}
 <div><strong>Payment:</strong> {
 viewOrder.paymentMethod ==="CASH_IN_CLINIC" ?"Pay in clinic" :"Cash on delivery"
 }</div>
 {viewOrder.notes && (
 <div><strong>Notes:</strong> {viewOrder.notes}</div>
 )}
 </div>

 {/* Items */}
 <div>
 <div className="mb-2 text-sm font-semibold">Items</div>
 <div className="space-y-2">
 {viewOrder.items.map((it) => (
 <div key={it.id} className="flex justify-between text-sm border-b pb-2">
 <div>
 <div className="font-medium">{it.name}</div>
 <div className="text-xs text-muted-foreground">
 {it.quantity} × {formatMoney(it.price)}
 </div>
 </div>
 <div className="font-medium">{formatMoney(it.total)}</div>
 </div>
 ))}
 </div>
 </div>

 <div className="flex justify-between border-t pt-3">
 <span className="font-semibold">Total</span>
 <span className="text-lg font-bold text-primary">
 {formatMoney(viewOrder.total)}
 </span>
 </div>

 {/* Actions */}
 {viewOrder.status ==="PENDING" && (
 <div className="grid grid-cols-2 gap-2">
 <Button
 className="bg-primary hover:bg-secondary"
 onClick={() => statusMutation.mutate({ id: viewOrder.id, status: ORDER_STATUS.COMPLETED })}
 disabled={statusMutation.isPending}
 >
 <CheckCircle2 className="mr-1 h-4 w-4" />
 Mark completed
 </Button>
 <Button
 variant="outline"
 className="text-primary hover:bg-blush"
 onClick={() => setCancelOrder(viewOrder)}
 >
 <XCircle className="mr-1 h-4 w-4" />
 Cancel order
 </Button>
 </div>
 )}
 {viewOrder.status ==="COMPLETED" && (
 <div className="rounded-md bg-blush p-3 text-sm text-primary flex items-center gap-2">
 <CheckCircle2 className="h-4 w-4" />
 Order completed. Stock has been deducted.
 </div>
 )}
 {viewOrder.status ==="CANCELLED" && (
 <div className="rounded-md bg-blush p-3 text-sm text-secondary flex items-center gap-2">
 <XCircle className="h-4 w-4" />
 Order cancelled. Stock was restocked.
 </div>
 )}
 </div>
 )}
 </DialogContent>
 </Dialog>

 {/* Cancel confirmation */}
 <AlertDialog open={!!cancelOrder} onOpenChange={(o) => !o && setCancelOrder(null)}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
 <AlertDialogDescription>
 The order will be marked as cancelled and stock items will be restocked.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Keep order</AlertDialogCancel>
 <AlertDialogAction
 className="bg-primary hover:bg-primary/90"
 onClick={() => cancelOrder && cancelMutation.mutate(cancelOrder.id)}
 >
 Cancel order
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 )
}
