"use client"

import { useState, useMemo, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPatch } from "@/lib/api-client"
import {
  formatTime, formatDateTime, formatDate,
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  addDays, sameDay, toISODate,
} from "@/lib/format"
import {
  APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_COLOR,
  SLOT_STATUS_LABEL, SLOT_STATUS_COLOR,
} from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar as CalIcon, List, Grid3x3, CalendarDays, Clock, User, Phone, Sparkles, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

type View = "day" | "week" | "month"

interface Appointment {
  id: string
  status: string
  price: number
  note: string | null
  customer: { id: string; name: string; phone: string; email: string | null }
  service: { id: string; name: string; durationMin: number; price: number; category: string }
  slot: { id: string; startTime: string; endTime: string; status: string }
}

interface Slot {
  id: string
  startTime: string
  endTime: string
  status: string
  note: string | null
  serviceId: string
  service: { id: string; name: string; durationMin: number }
  appointments: Appointment[]
}

export function AdminCalendarPage() {
  const queryClient = useQueryClient()
  const [view, setView] = useState<View>("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [draggedApptId, setDraggedApptId] = useState<string | null>(null)
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null)
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  const [confirmCancel, setConfirmCancel] = useState<Appointment | null>(null)

  // Compute date range
  const { start, end } = useMemo(() => {
    if (view === "day") return { start: startOfDay(currentDate), end: endOfDay(currentDate) }
    if (view === "week") return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) }
    return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) }
  }, [view, currentDate])

  const { data, isLoading } = useQuery({
    queryKey: ["slots", "calendar", start.toISOString(), end.toISOString(), serviceFilter],
    queryFn: () =>
      apiGet<{ slots: Slot[] }>(
        `/api/slots?from=${start.toISOString()}&to=${end.toISOString()}`
      ),
  })

  const { data: servicesData } = useQuery({
    queryKey: ["services", "all"],
    queryFn: () => apiGet<{ services: { id: string; name: string }[] }>("/api/services?includeInactive=1"),
  })

  const slots = (data?.slots || []).filter(
    (s) => serviceFilter === "all" || s.serviceId === serviceFilter
  )

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const slot of slots) {
      const dateKey = toISODate(new Date(slot.startTime))
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(slot)
    }
    return map
  }, [slots])

  // Get all appointments (flattened) for reschedule target finding
  const allAppointments = useMemo(() => {
    return slots.flatMap((s) => s.appointments)
  }, [slots])

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/api/appointments/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast.success("Appointment updated")
      setSelectedAppt(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, newSlotId }: { id: string; newSlotId: string }) =>
      apiPatch(`/api/appointments/${id}/reschedule`, { newSlotId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast.success("Appointment rescheduled")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiPatch(`/api/appointments/${id}/status`, { status: "CANCELLED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast.success("Appointment cancelled")
      setConfirmCancel(null)
      setSelectedAppt(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, apptId: string) => {
    setDraggedApptId(apptId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", apptId)
  }

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverSlotId !== slotId) setDragOverSlotId(slotId)
  }

  const handleDragLeave = (_e: React.DragEvent, slotId: string) => {
    if (dragOverSlotId === slotId) setDragOverSlotId(null)
  }

  const handleDrop = (e: React.DragEvent, targetSlot: Slot) => {
    e.preventDefault()
    setDragOverSlotId(null)
    const apptId = e.dataTransfer.getData("text/plain") || draggedApptId
    setDraggedApptId(null)
    if (!apptId) return
    if (targetSlot.appointments.some((a) => a.id === apptId)) return
    if (targetSlot.status !== "AVAILABLE") {
      toast.error("Target slot is not available")
      return
    }
    const appt = allAppointments.find((a) => a.id === apptId)
    if (!appt) return
    if (appt.service && targetSlot.serviceId !== appt.service.id) {
      toast.error("Target slot must be for the same service")
      return
    }
    rescheduleMutation.mutate({ id: apptId, newSlotId: targetSlot.id })
  }

  const goPrev = useCallback(() => {
    if (view === "day") setCurrentDate((d) => addDays(d, -1))
    else if (view === "week") setCurrentDate((d) => addDays(d, -7))
    else {
      const x = new Date(currentDate)
      x.setMonth(x.getMonth() - 1)
      setCurrentDate(x)
    }
  }, [view, currentDate])

  const goNext = useCallback(() => {
    if (view === "day") setCurrentDate((d) => addDays(d, 1))
    else if (view === "week") setCurrentDate((d) => addDays(d, 7))
    else {
      const x = new Date(currentDate)
      x.setMonth(x.getMonth() + 1)
      setCurrentDate(x)
    }
  }, [view, currentDate])

  const goToday = () => setCurrentDate(new Date())

  // Build the days to display
  const days = useMemo(() => {
    if (view === "day") return [currentDate]
    if (view === "week") {
      const start = startOfWeek(currentDate)
      return Array.from({ length: 7 }).map((_, i) => addDays(start, i))
    }
    // month: show 6 weeks starting from the week of day 1
    const monthStart = startOfMonth(currentDate)
    const gridStart = startOfWeek(monthStart)
    return Array.from({ length: 42 }).map((_, i) => addDays(gridStart, i))
  }, [view, currentDate])

  const title = useMemo(() => {
    if (view === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      })
    }
    if (view === "week") {
      const s = startOfWeek(currentDate)
      const e = endOfWeek(currentDate)
      return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    }
    return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }, [view, currentDate])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Drag appointments to reschedule. Click to view details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-40 sm:w-48">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {(servicesData?.services || []).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-3 text-sm font-semibold">{title}</div>
        </div>

        <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
          <Button
            size="sm"
            variant={view === "day" ? "default" : "ghost"}
            onClick={() => setView("day")}
            className={view === "day" ? "bg-rose-500 hover:bg-rose-600" : ""}
          >
            <List className="mr-1 h-3.5 w-3.5" />
            Day
          </Button>
          <Button
            size="sm"
            variant={view === "week" ? "default" : "ghost"}
            onClick={() => setView("week")}
            className={view === "week" ? "bg-rose-500 hover:bg-rose-600" : ""}
          >
            <CalendarDays className="mr-1 h-3.5 w-3.5" />
            Week
          </Button>
          <Button
            size="sm"
            variant={view === "month" ? "default" : "ghost"}
            onClick={() => setView("month")}
            className={view === "month" ? "bg-rose-500 hover:bg-rose-600" : ""}
          >
            <Grid3x3 className="mr-1 h-3.5 w-3.5" />
            Month
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-100 border border-emerald-300" />
          <span className="text-muted-foreground">Available slot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-rose-100 border border-rose-300" />
          <span className="text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-amber-100 border border-amber-300" />
          <span className="text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-slate-200 border border-slate-300" />
          <span className="text-muted-foreground">Blocked / Holiday</span>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          {isLoading ? (
            <div className="h-96 shimmer rounded-lg" />
          ) : view === "month" ? (
            <MonthView
              days={days}
              currentDate={currentDate}
              slotsByDate={slotsByDate}
              onSlotClick={(slot) => {
                if (slot.appointments[0]) setSelectedAppt(slot.appointments[0])
              }}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              dragOverSlotId={dragOverSlotId}
            />
          ) : view === "week" ? (
            <WeekView
              days={days}
              slotsByDate={slotsByDate}
              onSlotClick={(slot) => {
                if (slot.appointments[0]) setSelectedAppt(slot.appointments[0])
              }}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              dragOverSlotId={dragOverSlotId}
            />
          ) : (
            <DayView
              day={currentDate}
              slots={slotsByDate.get(toISODate(currentDate)) || []}
              onSlotClick={(slot) => {
                if (slot.appointments[0]) setSelectedAppt(slot.appointments[0])
              }}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              dragOverSlotId={dragOverSlotId}
            />
          )}
        </CardContent>
      </Card>

      {/* Appointment detail dialog */}
      <Dialog open={!!selectedAppt} onOpenChange={(o) => !o && setSelectedAppt(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedAppt && formatDateTime(selectedAppt.slot.startTime)}
            </DialogDescription>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={APPOINTMENT_STATUS_COLOR[selectedAppt.status]} variant="outline">
                  {APPOINTMENT_STATUS_LABEL[selectedAppt.status]}
                </Badge>
                <span className="text-lg font-bold text-rose-600">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(selectedAppt.price)}
                </span>
              </div>

              <div className="space-y-2 rounded-lg bg-muted/30 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rose-500" />
                  <span className="font-medium">{selectedAppt.service.name}</span>
                  <span className="text-muted-foreground">· {selectedAppt.service.durationMin}min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-rose-500" />
                  <span>{formatTime(selectedAppt.slot.startTime)} – {formatTime(selectedAppt.slot.endTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-rose-500" />
                  <span>{selectedAppt.customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-rose-500" />
                  <span>{selectedAppt.customer.phone}</span>
                </div>
                {selectedAppt.note && (
                  <div className="border-t pt-2 text-muted-foreground">
                    <strong>Note:</strong> {selectedAppt.note}
                  </div>
                )}
              </div>

              {selectedAppt.status === "BOOKED" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => statusMutation.mutate({ id: selectedAppt.id, status: "COMPLETED" })}
                    disabled={statusMutation.isPending}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={() => setConfirmCancel(selectedAppt)}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
              {selectedAppt.status === "COMPLETED" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => statusMutation.mutate({ id: selectedAppt.id, status: "BOOKED" })}
                  disabled={statusMutation.isPending}
                >
                  Mark as booked again
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation */}
      <AlertDialog open={!!confirmCancel} onOpenChange={(o) => !o && setConfirmCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will free up the time slot. The customer will not be notified automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep appointment</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600"
              onClick={() => confirmCancel && cancelMutation.mutate(confirmCancel.id)}
            >
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================================================
// Month view - compact grid
// ============================================================================
function MonthView({
  days, currentDate, slotsByDate, onSlotClick,
  onDragStart, onDragOver, onDragLeave, onDrop, dragOverSlotId,
}: {
  days: Date[]
  currentDate: Date
  slotsByDate: Map<string, Slot[]>
  onSlotClick: (slot: Slot) => void
  onDragStart: (e: React.DragEvent, apptId: string) => void
  onDragOver: (e: React.DragEvent, slotId: string) => void
  onDragLeave: (e: React.DragEvent, slotId: string) => void
  onDrop: (e: React.DragEvent, slot: Slot) => void
  dragOverSlotId: string | null
}) {
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const daySlots = slotsByDate.get(toISODate(day)) || []
          const isCurrentMonth = day.getMonth() === currentDate.getMonth()
          const isToday = sameDay(day, new Date())
          const appts = daySlots.flatMap((s) => s.appointments)

          return (
            <div
              key={day.toISOString()}
              className={`min-h-24 sm:min-h-28 rounded-md border p-1 ${
                !isCurrentMonth ? "bg-muted/20 opacity-50" : "bg-card"
              } ${isToday ? "border-rose-400 bg-rose-50/50" : "border-border"}`}
            >
              <div className={`text-right text-xs ${isToday ? "font-bold text-rose-600" : "text-muted-foreground"}`}>
                {day.getDate()}
              </div>
              <div className="mt-1 space-y-0.5">
                {appts.slice(0, 3).map((appt) => (
                  <div
                    key={appt.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, appt.id)}
                    onClick={(e) => {
                      e.stopPropagation()
                      const slot = daySlots.find((s) => s.appointments.some((a) => a.id === appt.id))
                      if (slot) onSlotClick(slot)
                    }}
                    className={`cursor-pointer truncate rounded px-1 py-0.5 text-[10px] ${
                      appt.status === "BOOKED"
                        ? "bg-rose-100 text-rose-700"
                        : appt.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    } hover:opacity-80`}
                  >
                    {formatTime(appt.slot?.startTime)} {appt.customer?.name?.split(" ")[0] || "Customer"}
                  </div>
                ))}
                {appts.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{appts.length - 3} more
                  </div>
                )}
                {/* Available slot drop zones */}
                {daySlots.filter((s) => s.status === "AVAILABLE").slice(0, 2).map((slot) => (
                  <div
                    key={slot.id}
                    onDragOver={(e) => onDragOver(e, slot.id)}
                    onDragLeave={(e) => onDragLeave(e, slot.id)}
                    onDrop={(e) => onDrop(e, slot)}
                    className={`truncate rounded px-1 py-0.5 text-[10px] text-emerald-700 bg-emerald-50 border border-dashed border-emerald-200 ${
                      dragOverSlotId === slot.id ? "drag-over" : ""
                    }`}
                  >
                    {formatTime(slot.startTime)} open
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Week view - 7 day columns with hour rows
// ============================================================================
function WeekView({
  days, slotsByDate, onSlotClick,
  onDragStart, onDragOver, onDragLeave, onDrop, dragOverSlotId,
}: {
  days: Date[]
  slotsByDate: Map<string, Slot[]>
  onSlotClick: (slot: Slot) => void
  onDragStart: (e: React.DragEvent, apptId: string) => void
  onDragOver: (e: React.DragEvent, slotId: string) => void
  onDragLeave: (e: React.DragEvent, slotId: string) => void
  onDrop: (e: React.DragEvent, slot: Slot) => void
  dragOverSlotId: string | null
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
      {days.map((day) => {
        const daySlots = (slotsByDate.get(toISODate(day)) || []).sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        const isToday = sameDay(day, new Date())
        return (
          <div key={day.toISOString()} className="min-h-48">
            <div className={`sticky top-0 mb-1 rounded-md p-1 text-center text-xs font-medium ${
              isToday ? "bg-rose-500 text-white" : "bg-muted/50 text-muted-foreground"
            }`}>
              {day.toLocaleDateString("en-US", { weekday: "short" })}
              <div className="text-sm font-bold">{day.getDate()}</div>
            </div>
            <div className="space-y-1">
              {daySlots.length === 0 ? (
                <div className="rounded-md border border-dashed py-4 text-center text-[10px] text-muted-foreground">
                  No slots
                </div>
              ) : (
                daySlots.map((slot) => {
                  const appt = slot.appointments[0]
                  if (appt) {
                    return (
                      <div
                        key={slot.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, appt.id)}
                        onClick={() => onSlotClick(slot)}
                        className={`cursor-pointer rounded-md p-1.5 text-[11px] transition hover:opacity-80 ${
                          appt.status === "BOOKED"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : appt.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <div className="font-semibold">
                          {formatTime(slot.startTime)}
                        </div>
                        <div className="truncate">{appt.customer?.name || "Customer"}</div>
                        <div className="truncate text-[10px] opacity-75">
                          {appt.service?.name || "Service"}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={slot.id}
                      onDragOver={(e) => onDragOver(e, slot.id)}
                      onDragLeave={(e) => onDragLeave(e, slot.id)}
                      onDrop={(e) => onDrop(e, slot)}
                      className={`rounded-md p-1.5 text-[11px] border border-dashed ${
                        slot.status === "AVAILABLE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-300"
                      } ${dragOverSlotId === slot.id ? "drag-over" : ""}`}
                    >
                      <div className="font-semibold">{formatTime(slot.startTime)}</div>
                      <div className="text-[10px] opacity-75">
                        {slot.status === "AVAILABLE" ? "Available" : slot.status === "BLOCKED" ? "Blocked" : "Holiday"}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// Day view - timeline style
// ============================================================================
function DayView({
  day, slots, onSlotClick,
  onDragStart, onDragOver, onDragLeave, onDrop, dragOverSlotId,
}: {
  day: Date
  slots: Slot[]
  onSlotClick: (slot: Slot) => void
  onDragStart: (e: React.DragEvent, apptId: string) => void
  onDragOver: (e: React.DragEvent, slotId: string) => void
  onDragLeave: (e: React.DragEvent, slotId: string) => void
  onDrop: (e: React.DragEvent, slot: Slot) => void
  dragOverSlotId: string | null
}) {
  const sorted = [...slots].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  return (
    <div className="space-y-2">
      <div className="rounded-lg bg-rose-50 p-3 text-center">
        <div className="text-sm font-semibold text-rose-700">
          {day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <div className="text-xs text-rose-600">
          {sorted.length} slot(s) · {sorted.filter((s) => s.appointments.length > 0).length} booked
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <CalIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No slots created for this day.
          </p>
          <p className="text-xs text-muted-foreground">
            Visit the Time Slots page to create availability.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((slot) => {
            const appt = slot.appointments[0]
            const start = new Date(slot.startTime)
            return (
              <div
                key={slot.id}
                onDragOver={(e) => onDragOver(e, slot.id)}
                onDragLeave={(e) => onDragLeave(e, slot.id)}
                onDrop={(e) => onDrop(e, slot)}
                className={`flex gap-3 rounded-lg border p-3 transition ${
                  dragOverSlotId === slot.id ? "drag-over" : ""
                } ${
                  appt
                    ? appt.status === "BOOKED"
                      ? "border-rose-200 bg-rose-50/50"
                      : appt.status === "COMPLETED"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200 bg-slate-50/50"
                    : slot.status === "AVAILABLE"
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-slate-200 bg-slate-50/50"
                }`}
              >
                <div className="flex w-16 flex-shrink-0 flex-col items-center justify-center">
                  <div className="text-sm font-bold">
                    {start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).replace(":00", "")}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {slot.service?.durationMin}min
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {appt ? (
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, appt.id)}
                      onClick={() => onSlotClick(slot)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{appt.customer?.name || "Customer"}</div>
                        <Badge className={APPOINTMENT_STATUS_COLOR[appt.status]} variant="outline">
                          {APPOINTMENT_STATUS_LABEL[appt.status]}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {appt.service?.name || "Service"} · {appt.customer?.phone || ""}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <div className="font-medium text-muted-foreground">
                        {slot.service?.name || "Slot"}
                      </div>
                      <Badge className={SLOT_STATUS_COLOR[slot.status]} variant="outline">
                        {SLOT_STATUS_LABEL[slot.status]}
                      </Badge>
                      {slot.note && (
                        <div className="mt-1 text-xs text-muted-foreground">{slot.note}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
