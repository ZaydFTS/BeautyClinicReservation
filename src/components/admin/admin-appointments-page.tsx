"use client"

import { useState } from"react"
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query"
import { apiGet, apiPatch } from"@/lib/api-client"
import { formatMoney, formatDateTime, formatTime, addDays, toISODate } from"@/lib/format"
import { APPOINTMENT_STATUS, APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_COLOR } from"@/lib/constants"
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
import { Search, Eye, CheckCircle2, XCircle, Calendar } from"lucide-react"
import { toast } from"sonner"

interface Appointment {
 id: string
 status: string
 price: number
 note: string | null
 customer: { id: string; name: string; phone: string; email: string | null }
 service: { id: string; name: string; durationMin: number }
 slot: { id: string; startTime: string; endTime: string }
}

export function AdminAppointmentsPage() {
 const queryClient = useQueryClient()
 const [q, setQ] = useState("")
 const [statusFilter, setStatusFilter] = useState("all")
 const [daysAhead, setDaysAhead] = useState("14")
 const [viewAppt, setViewAppt] = useState<Appointment | null>(null)

 const start = new Date()
 start.setHours(0, 0, 0, 0)
 const end = addDays(start, parseInt(daysAhead))

 const { data, isLoading } = useQuery({
 queryKey: ["appointments","list", start.toISOString(), end.toISOString()],
 queryFn: () =>
 apiGet<{ appointments: Appointment[] }>(
 `/api/appointments?from=${start.toISOString()}&to=${end.toISOString()}`
 ),
 })

 const appts = (data?.appointments || [])
 .filter((a) => statusFilter ==="all" || a.status === statusFilter)
 .filter((a) =>
 !q ||
 a.customer.name.toLowerCase().includes(q.toLowerCase()) ||
 a.customer.phone.includes(q) ||
 a.service.name.toLowerCase().includes(q.toLowerCase())
 )

 const statusMutation = useMutation({
 mutationFn: ({ id, status }: { id: string; status: string }) =>
 apiPatch(`/api/appointments/${id}/status`, { status }),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["appointments"] })
 queryClient.invalidateQueries({ queryKey: ["slots"] })
 queryClient.invalidateQueries({ queryKey: ["dashboard"] })
 toast.success("Appointment updated")
 setViewAppt(null)
 },
 onError: (err: Error) => toast.error(err.message),
 })

 return (
 <div className="space-y-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
 <p className="text-sm text-muted-foreground">
 All upcoming appointments. Visit Calendar for drag-and-drop scheduling.
 </p>
 </div>

 <div className="flex flex-wrap gap-2">
 <div className="relative flex-1 min-w-48">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search by customer, phone, or service..."
 value={q}
 onChange={(e) => setQ(e.target.value)}
 className="pl-9"
 />
 </div>
 <Select value={statusFilter} onValueChange={setStatusFilter}>
 <SelectTrigger className="w-36">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All statuses</SelectItem>
 <SelectItem value="BOOKED">Booked</SelectItem>
 <SelectItem value="COMPLETED">Completed</SelectItem>
 <SelectItem value="CANCELLED">Cancelled</SelectItem>
 <SelectItem value="NO_SHOW">No-show</SelectItem>
 </SelectContent>
 </Select>
 <Select value={daysAhead} onValueChange={setDaysAhead}>
 <SelectTrigger className="w-32">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="1">Today</SelectItem>
 <SelectItem value="7">Next 7d</SelectItem>
 <SelectItem value="14">Next 14d</SelectItem>
 <SelectItem value="30">Next 30d</SelectItem>
 <SelectItem value="90">Next 90d</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <Card>
 <CardContent className="p-0">
 {isLoading ? (
 <div className="h-64 shimmer" />
 ) : appts.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16">
 <Calendar className="h-12 w-12 text-muted-foreground" />
 <p className="mt-2 text-sm text-muted-foreground">No appointments found.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>When</TableHead>
 <TableHead>Customer</TableHead>
 <TableHead>Service</TableHead>
 <TableHead className="text-right">Price</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {appts.map((a) => (
 <TableRow key={a.id}>
 <TableCell>
 <div className="font-medium">
 {formatDateTime(a.slot.startTime)}
 </div>
 <div className="text-xs text-muted-foreground">
 {formatTime(a.slot.startTime)} – {formatTime(a.slot.endTime)}
 </div>
 </TableCell>
 <TableCell>
 <div className="font-medium">{a.customer.name}</div>
 <div className="text-xs text-muted-foreground">{a.customer.phone}</div>
 </TableCell>
 <TableCell>{a.service.name}</TableCell>
 <TableCell className="text-right font-medium">
 {formatMoney(a.price)}
 </TableCell>
 <TableCell>
 <Badge className={APPOINTMENT_STATUS_COLOR[a.status]} variant="outline">
 {APPOINTMENT_STATUS_LABEL[a.status]}
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 <Button
 variant="ghost"
 size="icon"
 className="h-9 w-9"
 onClick={() => setViewAppt(a)}
 aria-label="View appointment"
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

 {/* Detail dialog */}
 <Dialog open={!!viewAppt} onOpenChange={(o) => !o && setViewAppt(null)}>
 <DialogContent className="sm:max-w-md">
 <DialogHeader>
 <DialogTitle>Appointment Details</DialogTitle>
 <DialogDescription>
 {viewAppt && formatDateTime(viewAppt.slot.startTime)}
 </DialogDescription>
 </DialogHeader>
 {viewAppt && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <Badge className={APPOINTMENT_STATUS_COLOR[viewAppt.status]} variant="outline">
 {APPOINTMENT_STATUS_LABEL[viewAppt.status]}
 </Badge>
 <span className="text-lg font-bold text-primary">
 {formatMoney(viewAppt.price)}
 </span>
 </div>
 <div className="rounded-lg bg-muted/30 p-3 text-sm space-y-1">
 <div><strong>Service:</strong> {viewAppt.service.name}</div>
 <div><strong>Duration:</strong> {viewAppt.service.durationMin} min</div>
 <div><strong>Customer:</strong> {viewAppt.customer.name}</div>
 <div><strong>Phone:</strong> {viewAppt.customer.phone}</div>
 {viewAppt.customer.email && (
 <div><strong>Email:</strong> {viewAppt.customer.email}</div>
 )}
 {viewAppt.note && (
 <div><strong>Note:</strong> {viewAppt.note}</div>
 )}
 </div>
 {viewAppt.status ==="BOOKED" && (
 <div className="grid grid-cols-2 gap-2">
 <Button
 className="bg-primary hover:bg-secondary"
 onClick={() =>
 statusMutation.mutate({ id: viewAppt.id, status: APPOINTMENT_STATUS.COMPLETED })
 }
 >
 <CheckCircle2 className="mr-1 h-4 w-4" />
 Complete
 </Button>
 <Button
 variant="outline"
 className="text-primary"
 onClick={() =>
 statusMutation.mutate({ id: viewAppt.id, status: APPOINTMENT_STATUS.CANCELLED })
 }
 >
 <XCircle className="mr-1 h-4 w-4" />
 Cancel
 </Button>
 </div>
 )}
 </div>
 )}
 </DialogContent>
 </Dialog>
 </div>
 )
}
