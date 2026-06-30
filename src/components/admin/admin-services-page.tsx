"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { SERVICE_CATEGORIES } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Clock, Sparkles, Search } from "lucide-react"
import { toast } from "sonner"

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  durationMin: number
  category: string
  active: boolean
}

export function AdminServicesPage() {
  const queryClient = useQueryClient()
  const [q, setQ] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editSvc, setEditSvc] = useState<Service | null>(null)
  const [deleteSvc, setDeleteSvc] = useState<Service | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["services", "all"],
    queryFn: () => apiGet<{ services: Service[] }>("/api/services?includeInactive=1"),
  })

  const services = (data?.services || []).filter((s) =>
    !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.category.toLowerCase().includes(q.toLowerCase())
  )

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost("/api/services", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      toast.success("Service created")
      setCreateOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPut(`/api/services/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      toast.success("Service updated")
      setEditSvc(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      toast.success("Service removed")
      setDeleteSvc(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const toggleActive = (svc: Service) => {
    updateMutation.mutate({ id: svc.id, body: { active: !svc.active } })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground">
            Manage treatments, pricing, and availability.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-rose-500 hover:bg-rose-600">
          <Plus className="mr-1.5 h-4 w-4" />
          New Service
        </Button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="h-64 shimmer rounded-lg" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <Card key={svc.id} className={!svc.active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                    {svc.category}
                  </Badge>
                  <Switch
                    checked={svc.active}
                    onCheckedChange={() => toggleActive(svc)}
                  />
                </div>
                <CardTitle className="mt-2 text-base">{svc.name}</CardTitle>
                {svc.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{svc.description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-rose-600">{formatMoney(svc.price)}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {svc.durationMin} min
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setEditSvc(svc)} aria-label="Edit service">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-rose-600"
                      onClick={() => setDeleteSvc(svc)}
                      aria-label="Delete service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <ServiceFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(body) => createMutation.mutate({ body })}
      />

      {/* Edit dialog */}
      {editSvc && (
        <ServiceFormDialog
          open
          onOpenChange={(o) => !o && setEditSvc(null)}
          service={editSvc}
          onSubmit={(body) => updateMutation.mutate({ id: editSvc.id, body })}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteSvc} onOpenChange={(o) => !o && setDeleteSvc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {deleteSvc && (
              <>
                <strong>{deleteSvc.name}</strong> will be removed.
                If it has appointments or slots, it will be deactivated instead.
              </>
            )}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600"
              onClick={() => deleteSvc && deleteMutation.mutate(deleteSvc.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ServiceFormDialog({
  open, onOpenChange, service, onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  service?: Service
  onSubmit: (body: Record<string, unknown>) => void
}) {
  const [name, setName] = useState(service?.name || "")
  const [description, setDescription] = useState(service?.description || "")
  const [price, setPrice] = useState(service?.price.toString() || "")
  const [durationMin, setDurationMin] = useState(service?.durationMin.toString() || "30")
  const [category, setCategory] = useState(service?.category || "Waxing")
  const [active, setActive] = useState(service?.active ?? true)

  const handleSubmit = () => {
    if (!name) {
      toast.error("Name is required")
      return
    }
    const p = parseFloat(price)
    const d = parseInt(durationMin)
    if (Number.isNaN(p) || p < 0) {
      toast.error("Invalid price")
      return
    }
    if (Number.isNaN(d) || d < 1) {
      toast.error("Invalid duration")
      return
    }
    onSubmit({
      name,
      description: description || null,
      price: p,
      durationMin: d,
      category,
      active,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "New Service"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Underarm Laser Waxing" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the treatment..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input type="number" min="1" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">Active</div>
              <div className="text-xs text-muted-foreground">Inactive services are hidden from customers</div>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-rose-500 hover:bg-rose-600" onClick={handleSubmit}>
            {service ? "Save changes" : "Create service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
