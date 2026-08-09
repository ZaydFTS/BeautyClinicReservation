"use client"

import { useState } from"react"
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query"
import { apiGet, apiPost, apiPut, apiDelete } from"@/lib/api-client"
import { formatMoney } from"@/lib/format"
import { SERVICE_CATEGORIES } from"@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Badge } from"@/components/ui/badge"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import { Textarea } from"@/components/ui/textarea"
import { Switch } from"@/components/ui/switch"
import {
 Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from"@/components/ui/select"
import {
 Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from"@/components/ui/dialog"
import {
 AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
 AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from"@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Clock, Sparkles, Search } from"lucide-react"
import { toast } from"sonner"
import { ImageUpload } from"@/components/shared/image-upload"

interface Service {
 id: string
 name: string
 description: string | null
 price: number
 durationMin: number
 category: string
 imageUrl: string | null
 active: boolean
}

export function AdminServicesPage() {
 const queryClient = useQueryClient()
 const [q, setQ] = useState("")
 const [createOpen, setCreateOpen] = useState(false)
 const [editSvc, setEditSvc] = useState<Service | null>(null)
 const [deleteSvc, setDeleteSvc] = useState<Service | null>(null)

 const { data, isLoading } = useQuery({
 queryKey: ["services","all"],
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
 <Button onClick={() => setCreateOpen(true)} className="btn-press bg-primary hover:bg-primary/90">
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
 <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 stagger-children">
 {services.map((svc) => (
 <Card
 key={svc.id}
 className={`card-lift group relative gap-0 overflow-hidden rounded-2xl border-outline-variant/70 py-0 shadow-none transition-all duration-300 hover:border-primary ${!svc.active ? "opacity-60" : ""}`}
 >
 {/* Image area */}
 <div className="relative aspect-[4/3] w-full overflow-hidden bg-blush">
 {svc.imageUrl ? (
 <img
 src={svc.imageUrl}
 alt={svc.name}
 className="img-zoom h-full w-full object-cover"
 loading="lazy"
 />
 ) : (
 <div className="flex h-full items-center justify-center">
 <Sparkles className="h-12 w-12 text-primary/25" />
 </div>
 )}
 {/* Category badge - top left */}
 <div className="absolute left-3 top-3">
 <span className="inline-flex items-center rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary shadow-sm backdrop-blur-md">
 {svc.category}
 </span>
 </div>
 {/* Duration badge - top right */}
 <div className="absolute right-3 top-3">
 <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
 <Clock className="h-2.5 w-2.5" />
 {svc.durationMin} MIN
 </span>
 </div>
 {/* Active/Inactive status pill - bottom left */}
 <div className="absolute bottom-3 left-3">
 <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${svc.active ? "bg-white/85 text-secondary" : "bg-secondary text-white"}`}>
 <span className={`h-1.5 w-1.5 rounded-full ${svc.active ? "bg-primary" : "bg-white"}`} />
 {svc.active ? "Active" : "Hidden"}
 </span>
 </div>
 </div>
 {/* Content */}
 <CardHeader className="relative space-y-2 p-5 pb-2">
 <CardTitle className="font-serif text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-secondary">
 {svc.name}
 </CardTitle>
 {svc.description && (
 <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{svc.description}</p>
 )}
 </CardHeader>
 <CardContent className="relative p-5 pt-0">
 {/* Toggle + price row */}
 <div className="flex items-center justify-between pt-2">
 <div>
 <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
 Price
 </div>
 <div className="text-primary text-xl font-bold tracking-tight">{formatMoney(svc.price)}</div>
 </div>
 {/* Active toggle */}
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
 {svc.active ? "Visible" : "Hidden"}
 </span>
 <Switch
 checked={svc.active}
 onCheckedChange={() => toggleActive(svc)}
 />
 </div>
 </div>
 {/* Action buttons row */}
 <div className="mt-4 flex gap-2 border-t border-outline-variant/60 pt-3">
 <Button
 variant="outline"
 size="sm"
 className="press-feedback flex-1 border-outline-variant text-secondary hover:border-primary hover:bg-primary hover:text-white"
 onClick={() => setEditSvc(svc)}
 >
 <Edit className="mr-1.5 h-3.5 w-3.5" />
 Edit
 </Button>
 <Button
 variant="outline"
 size="sm"
 className="press-feedback flex-1 border-outline-variant text-secondary hover:border-primary hover:bg-primary hover:text-white"
 onClick={() => setDeleteSvc(svc)}
 >
 <Trash2 className="mr-1.5 h-3.5 w-3.5" />
 Delete
 </Button>
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
 className="bg-primary hover:bg-primary/90"
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
 const [name, setName] = useState(service?.name ||"")
 const [description, setDescription] = useState(service?.description ||"")
 const [price, setPrice] = useState(service?.price.toString() ||"")
 const [durationMin, setDurationMin] = useState(service?.durationMin.toString() ||"30")
 const [category, setCategory] = useState(service?.category ||"Waxing")
 const [imageUrl, setImageUrl] = useState(service?.imageUrl ||"")
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
 imageUrl: imageUrl || null,
 active,
 })
 }

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="sm:max-w-md">
 <DialogHeader>
 <DialogTitle>{service ?"Edit Service" :"New Service"}</DialogTitle>
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
 {/* Service Image */}
 <ImageUpload
 value={imageUrl}
 onChange={setImageUrl}
 label="Service Image"
 />
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
 <Button variant="outline" className="press-feedback" onClick={() => onOpenChange(false)}>Cancel</Button>
 <Button className="btn-press bg-primary hover:bg-primary/90" onClick={handleSubmit}>
 {service ?"Save changes" :"Create service"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
