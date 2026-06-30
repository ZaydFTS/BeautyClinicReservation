"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client"
import { formatTime, formatDateTime, toISODate, addDays, sameDay } from "@/lib/format"
import { SLOT_STATUS, SLOT_STATUS_LABEL, SLOT_STATUS_COLOR, SERVICE_CATEGORIES } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Clock, Plus, ChevronLeft, ChevronRight, Calendar as CalIcon, Trash2, Edit, XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface Service {
  id: string
  name: string
  durationMin: number
  category: string
}

interface Slot {
  id: string
  serviceId: string
  startTime: string
  endTime: string
  capacity: number
  status: string
  note: string | null
  service: Service
  appointments: { id: string; status: string }[]
}

const WEEKDAYS = [
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
  { id: 0, label: "Sun" },
]

export function AdminSlotsPage() {
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterService, setFilterService] = useState("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [editSlot, setEditSlot] = useState<Slot | null>(null)
  const [deleteSlot, setDeleteSlot] = useState<Slot | null>(null)

  const dayStr = toISODate(currentDate)
  const { data: servicesData } = useQuery({
    queryKey: ["services", "all"],
    queryFn: () => apiGet<{ services: Service[] }>("/api/services?includeInactive=1"),
  })

  const { data, isLoading } = useQuery({
    queryKey: ["slots", "admin", dayStr],
    queryFn: () => apiGet<{ slots: Slot[] }>(`/api/slots?date=${dayStr}`),
  })

  const slots = (data?.slots || [])
    .filter((s) => filterService === "all" || s.serviceId === filterService)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const groupedByService = useMemo(() => {
    const map = new Map<string, { service: Service; slots: Slot[] }>()
    for (const slot of slots) {
      const k = slot.serviceId
      if (!map.has(k)) map.set(k, { service: slot.service, slots: [] })
      map.get(k)!.slots.push(slot)
    }
    return Array.from(map.values())
  }, [slots])

  const createMutation = useMutation({
    mutationFn: (payload: {
      serviceId: string
      startTime: string
      endTime: string
      status: string
      note?: string
    }) => apiPost("/api/slots", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] })
      toast.success("Slot created")
      setCreateOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPut(`/api/slots/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] })
      toast.success("Slot updated")
      setEditSlot(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/slots/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] })
      toast.success("Slot deleted")
      setDeleteSlot(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const blockMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      apiPut(`/api/slots/${id}`, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] })
      toast.success("Slot updated")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const goPrev = () => setCurrentDate((d) => addDays(d, -1))
  const goNext = () => setCurrentDate((d) => addDays(d, 1))
  const goToday = () => setCurrentDate(new Date())

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Slots</h1>
          <p className="text-sm text-muted-foreground">
            Manage available appointment times. Customers can only book these slots.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkOpen(true)}>
            <CalIcon className="mr-1.5 h-4 w-4" />
            Bulk Generate
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-rose-500 hover:bg-rose-600">
            <Plus className="mr-1.5 h-4 w-4" />
            New Slot
          </Button>
        </div>
      </div>

      {/* Date nav */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
            <Button variant="outline" size="icon" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = addDays(new Date(), i)
              const isSelected = sameDay(d, currentDate)
              return (
                <button
                  key={i}
                  onClick={() => setCurrentDate(d)}
                  className={`min-w-16 rounded-lg border p-1.5 text-center transition ${
                    isSelected ? "border-rose-500 bg-rose-50 text-rose-700" : "hover:border-rose-300"
                  }`}
                >
                  <div className="text-[10px] uppercase">
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="text-sm font-bold">{d.getDate()}</div>
                </button>
              )
            })}
          </div>
          <div className="text-sm font-semibold">
            {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-40 sm:w-56">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {(servicesData?.services || []).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Slots grouped by service */}
      {isLoading ? (
        <div className="h-64 shimmer rounded-lg" />
      ) : groupedByService.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No slots created for this day.
            </p>
            <Button
              className="mt-4 bg-rose-500 hover:bg-rose-600"
              onClick={() => setBulkOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Generate slots
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedByService.map(({ service, slots: svcSlots }) => (
            <Card key={service.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    <CardDescription>
                      {service.durationMin} min · {svcSlots.length} slot(s)
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                    {service.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {svcSlots.map((slot) => {
                    const appt = slot.appointments[0]
                    return (
                      <div
                        key={slot.id}
                        className={`rounded-lg border-2 p-2 text-center transition ${
                          appt
                            ? "border-rose-300 bg-rose-50"
                            : slot.status === "AVAILABLE"
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-slate-200 bg-slate-100"
                        }`}
                      >
                        <div className="text-sm font-bold">
                          {formatTime(slot.startTime)}
                        </div>
                        <div className="mt-1 text-[10px]">
                          {appt ? (
                            <Badge className="bg-rose-500 text-white" variant="secondary">
                              Booked
                            </Badge>
                          ) : (
                            <Badge className={SLOT_STATUS_COLOR[slot.status]} variant="outline">
                              {SLOT_STATUS_LABEL[slot.status]}
                            </Badge>
                          )}
                        </div>
                        {slot.note && (
                          <div className="mt-1 truncate text-[10px] text-muted-foreground" title={slot.note}>
                            {slot.note}
                          </div>
                        )}
                        <div className="mt-2 flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditSlot(slot)}
                            aria-label="Edit slot"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          {!appt && slot.status === "AVAILABLE" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-amber-600"
                              onClick={() =>
                                blockMutation.mutate({
                                  id: slot.id,
                                  status: "BLOCKED",
                                  note: "Manually blocked",
                                })
                              }
                              title="Block"
                              aria-label="Block slot"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {!appt && slot.status === "BLOCKED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600"
                              onClick={() =>
                                blockMutation.mutate({
                                  id: slot.id,
                                  status: "AVAILABLE",
                                  note: null,
                                })
                              }
                              title="Unblock"
                              aria-label="Unblock slot"
                            >
                              <Clock className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-600"
                            onClick={() => setDeleteSlot(slot)}
                            disabled={!!appt}
                            aria-label="Delete slot"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <CreateSlotDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        services={servicesData?.services || []}
        defaultDate={currentDate}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />

      {/* Bulk generate dialog */}
      <BulkGenerateDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        services={servicesData?.services || []}
        onSubmit={async (payload) => {
          try {
            const res = await apiPost<{ created: number }>("/api/slots/bulk", payload)
            toast.success(`Created ${res.created} slots`)
            queryClient.invalidateQueries({ queryKey: ["slots"] })
            setBulkOpen(false)
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed")
          }
        }}
      />

      {/* Edit dialog */}
      {editSlot && (
        <EditSlotDialog
          slot={editSlot}
          onOpenChange={(o) => !o && setEditSlot(null)}
          onSubmit={(body) => updateMutation.mutate({ id: editSlot.id, body })}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteSlot} onOpenChange={(o) => !o && setDeleteSlot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this slot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the time slot. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600"
              onClick={() => deleteSlot && deleteMutation.mutate(deleteSlot.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================================================
function CreateSlotDialog({
  open, onOpenChange, services, defaultDate, onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  services: Service[]
  defaultDate: Date
  onSubmit: (payload: {
    serviceId: string
    startTime: string
    endTime: string
    status: string
    note?: string
  }) => void
}) {
  const [serviceId, setServiceId] = useState("")
  const [date, setDate] = useState(toISODate(defaultDate))
  const [time, setTime] = useState("10:00")
  const [status, setStatus] = useState("AVAILABLE")
  const [note, setNote] = useState("")

  const selectedService = services.find((s) => s.id === serviceId)
  const endTime = useMemo(() => {
    if (!selectedService) return time
    const [h, m] = time.split(":").map(Number)
    const start = new Date(`${date}T${time}:00`)
    start.setMinutes(start.getMinutes() + selectedService.durationMin)
    return start.toTimeString().slice(0, 5)
  }, [selectedService, time, date])

  const handleSubmit = () => {
    if (!serviceId) {
      toast.error("Select a service")
      return
    }
    onSubmit({
      serviceId,
      startTime: `${date}T${time}:00`,
      endTime: `${date}T${endTime}:00`,
      status,
      note: note || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Time Slot</DialogTitle>
          <DialogDescription>
            Add a single available slot. Use bulk generate for many slots at once.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Service *</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.durationMin}min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Start time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          {selectedService && (
            <div className="rounded-md bg-rose-50 p-2 text-xs text-rose-700">
              End time: <strong>{endTime}</strong> (based on service duration: {selectedService.durationMin}min)
            </div>
          )}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
                <SelectItem value="HOLIDAY">Holiday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Lunch break" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-rose-500 hover:bg-rose-600" onClick={handleSubmit}>
            Create slot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
function BulkGenerateDialog({
  open, onOpenChange, services, onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  services: Service[]
  onSubmit: (payload: {
    serviceId: string
    startDate: string
    endDate: string
    daysOfWeek: number[]
    hours: number[]
    slotDurationMin?: number
    status: string
    note?: string
  }) => Promise<void>
}) {
  const [serviceId, setServiceId] = useState("")
  const [startDate, setStartDate] = useState(toISODate(new Date()))
  const [endDate, setEndDate] = useState(toISODate(addDays(new Date(), 13)))
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5, 6])
  const [hours, setHours] = useState<number[]>([9, 11, 13, 15, 17])

  const toggleDay = (id: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }
  const toggleHour = (h: number) => {
    setHours((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h].sort((a, b) => a - b)
    )
  }

  const handleSubmit = () => {
    if (!serviceId) {
      toast.error("Select a service")
      return
    }
    if (daysOfWeek.length === 0) {
      toast.error("Select at least one day of week")
      return
    }
    if (hours.length === 0) {
      toast.error("Select at least one hour")
      return
    }
    onSubmit({
      serviceId,
      startDate,
      endDate,
      daysOfWeek,
      hours,
      status: "AVAILABLE",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Generate Slots</DialogTitle>
          <DialogDescription>
            Create multiple slots across a date range. Overlapping slots are skipped automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Service *</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.durationMin}min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Days of week</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => toggleDay(d.id)}
                  className={`flex h-9 w-12 items-center justify-center rounded-md border text-xs transition ${
                    daysOfWeek.includes(d.id)
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-border hover:border-rose-300"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hours (slot start times)</Label>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => {
                const h = i + 8 // 8 AM to 7 PM
                return (
                  <button
                    key={h}
                    onClick={() => toggleHour(h)}
                    className={`flex h-8 w-14 items-center justify-center rounded-md border text-xs transition ${
                      hours.includes(h)
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-border hover:border-rose-300"
                    }`}
                  >
                    {h > 12 ? h - 12 : h}{h >= 12 ? "PM" : "AM"}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-rose-500 hover:bg-rose-600" onClick={handleSubmit}>
            Generate slots
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
function EditSlotDialog({
  slot, onOpenChange, onSubmit,
}: {
  slot: Slot
  onOpenChange: (v: boolean) => void
  onSubmit: (body: Record<string, unknown>) => void
}) {
  const start = new Date(slot.startTime)
  const end = new Date(slot.endTime)
  const [date, setDate] = useState(toISODate(start))
  const [startTime, setStartTime] = useState(start.toTimeString().slice(0, 5))
  const [endTime, setEndTime] = useState(end.toTimeString().slice(0, 5))
  const [status, setStatus] = useState(slot.status)
  const [note, setNote] = useState(slot.note || "")

  const handleSubmit = () => {
    onSubmit({
      startTime: `${date}T${startTime}:00`,
      endTime: `${date}T${endTime}:00`,
      status,
      note: note || null,
    })
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Slot</DialogTitle>
          <DialogDescription>
            {slot.service.name} · currently {SLOT_STATUS_LABEL[slot.status]}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>End</Label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
                <SelectItem value="HOLIDAY">Holiday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-rose-500 hover:bg-rose-600" onClick={handleSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
