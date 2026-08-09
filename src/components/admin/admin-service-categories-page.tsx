"use client"

import { useState } from"react"
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query"
import { apiGet, apiPost, apiPut, apiDelete } from"@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Badge } from"@/components/ui/badge"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import {
 Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from"@/components/ui/dialog"
import {
 AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
 AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from"@/components/ui/alert-dialog"
import {
 Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from"@/components/ui/table"
import { Plus, Edit, Trash2, Tag, Search } from"lucide-react"
import { toast } from"sonner"

interface ServiceCategory {
 id: string
 name: string
 color: string | null
 createdAt: string
 _count?: { services: number }
}

const COLOR_PRESETS = ["oklch(0.65 0.20 350)", // rose"oklch(0.72 0.15 50)", // peach"oklch(0.55 0.13 160)", // sage"oklch(0.78 0.16 80)", // gold"oklch(0.50 0.20 310)", // orchid"oklch(0.55 0.02 350)", // neutral
]

export function AdminServiceCategoriesPage() {
 const queryClient = useQueryClient()
 const [q, setQ] = useState("")
 const [createOpen, setCreateOpen] = useState(false)
 const [editCat, setEditCat] = useState<ServiceCategory | null>(null)
 const [deleteCat, setDeleteCat] = useState<ServiceCategory | null>(null)

 const { data, isLoading } = useQuery({
 queryKey: ["service-categories"],
 queryFn: () => apiGet<{ categories: ServiceCategory[] }>("/api/service-categories"),
 })

 const categories = (data?.categories || []).filter(
 (c) => !q || c.name.toLowerCase().includes(q.toLowerCase())
 )

 const createMutation = useMutation({
 mutationFn: (body: { name: string; color?: string }) =>
 apiPost("/api/service-categories", body),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["service-categories"] })
 toast.success("Category created")
 setCreateOpen(false)
 },
 onError: (err: Error) => toast.error(err.message),
 })

 const updateMutation = useMutation({
 mutationFn: ({ id, body }: { id: string; body: { name: string; color?: string } }) =>
 apiPut(`/api/service-categories/${id}`, body),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["service-categories"] })
 queryClient.invalidateQueries({ queryKey: ["services"] })
 toast.success("Category updated")
 setEditCat(null)
 },
 onError: (err: Error) => toast.error(err.message),
 })

 const deleteMutation = useMutation({
 mutationFn: (id: string) => apiDelete(`/api/service-categories/${id}`),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["service-categories"] })
 toast.success("Category deleted")
 setDeleteCat(null)
 },
 onError: (err: Error) => toast.error(err.message),
 })

 return (
 <div className="space-y-4">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Service Categories</h1>
 <p className="text-sm text-muted-foreground">
 Organize treatments into categories. Customers can filter the services page by these.
 </p>
 </div>
 <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90">
 <Plus className="mr-1.5 h-4 w-4" />
 New Category
 </Button>
 </div>

 <div className="relative w-full sm:w-72">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search categories..."
 value={q}
 onChange={(e) => setQ(e.target.value)}
 className="pl-9"
 />
 </div>

 <Card>
 <CardContent className="p-0">
 {isLoading ? (
 <div className="h-64 shimmer" />
 ) : categories.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16">
 <Tag className="h-12 w-12 text-muted-foreground" />
 <p className="mt-2 text-sm text-muted-foreground">
 {q ?"No categories match your search." :"No categories yet. Create your first one."}
 </p>
 {!q && (
 <Button
 className="mt-4 bg-primary hover:bg-primary/90"
 onClick={() => setCreateOpen(true)}
 >
 <Plus className="mr-1.5 h-4 w-4" />
 New Category
 </Button>
 )}
 </div>
 ) : (
 <div className="overflow-x-auto">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Name</TableHead>
 <TableHead>Color</TableHead>
 <TableHead className="text-center">Services</TableHead>
 <TableHead>Created</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {categories.map((c) => (
 <TableRow key={c.id}>
 <TableCell>
 <div className="flex items-center gap-2">
 <div
 className="h-3 w-3 rounded-full"
 style={{ background: c.color ||"oklch(0.85 0.05 350)" }}
 />
 <span className="font-medium">{c.name}</span>
 </div>
 </TableCell>
 <TableCell>
 {c.color ? (
 <Badge variant="outline" className="font-mono text-xs">
 {c.color}
 </Badge>
 ) : (
 <span className="text-xs text-muted-foreground">Default</span>
 )}
 </TableCell>
 <TableCell className="text-center">
 <Badge variant="secondary">{c._count?.services || 0}</Badge>
 </TableCell>
 <TableCell className="text-xs text-muted-foreground">
 {new Date(c.createdAt).toLocaleDateString("en-US", {
 month:"short",
 day:"numeric",
 year:"numeric",
 })}
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-1">
 <Button
 variant="ghost"
 size="icon"
 className="h-7 w-7"
 onClick={() => setEditCat(c)}
 >
 <Edit className="h-3.5 w-3.5" />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 className="h-7 w-7 text-primary"
 onClick={() => setDeleteCat(c)}
 disabled={(c._count?.services || 0) > 0}
 title={(c._count?.services || 0) > 0 ?"Reassign services first" :"Delete"}
 >
 <Trash2 className="h-3.5 w-3.5" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 )}
 </CardContent>
 </Card>

 {/* Create dialog */}
 <CategoryFormDialog
 open={createOpen}
 onOpenChange={setCreateOpen}
 onSubmit={(body) => createMutation.mutate(body)}
 />

 {/* Edit dialog */}
 {editCat && (
 <CategoryFormDialog
 open
 onOpenChange={(o) => !o && setEditCat(null)}
 category={editCat}
 onSubmit={(body) => updateMutation.mutate({ id: editCat.id, body })}
 />
 )}

 {/* Delete confirmation */}
 <AlertDialog open={!!deleteCat} onOpenChange={(o) => !o && setDeleteCat(null)}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Delete category?</AlertDialogTitle>
 <AlertDialogDescription>
 <strong>{deleteCat?.name}</strong> will be permanently removed.
 Services using this category will keep their legacy label but lose the link.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Cancel</AlertDialogCancel>
 <AlertDialogAction
 className="bg-primary hover:bg-primary/90"
 onClick={() => deleteCat && deleteMutation.mutate(deleteCat.id)}
 >
 Delete
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 )
}

function CategoryFormDialog({
 open, onOpenChange, category, onSubmit,
}: {
 open: boolean
 onOpenChange: (v: boolean) => void
 category?: ServiceCategory
 onSubmit: (body: { name: string; color?: string }) => void
}) {
 const [name, setName] = useState(category?.name ||"")
 const [color, setColor] = useState(category?.color ||"")

 const handleSubmit = () => {
 if (!name.trim()) {
 toast.error("Name is required")
 return
 }
 onSubmit({
 name: name.trim(),
 color: color || undefined,
 })
 }

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="sm:max-w-md">
 <DialogHeader>
 <DialogTitle>{category ?"Edit Category" :"New Service Category"}</DialogTitle>
 <DialogDescription>
 Categories help group treatments (e.g. Waxing, Laser, Skincare).
 </DialogDescription>
 </DialogHeader>
 <div className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="cat-name">Name *</Label>
 <Input
 id="cat-name"
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="e.g. Laser"
 autoFocus
 onKeyDown={(e) => e.key ==="Enter" && handleSubmit()}
 />
 </div>
 <div className="space-y-2">
 <Label>Color (optional)</Label>
 <div className="flex flex-wrap gap-2">
 {COLOR_PRESETS.map((c) => (
 <button
 key={c}
 type="button"
 onClick={() => setColor(c)}
 className={`h-8 w-8 rounded-full border-2 transition ${
 color === c ?"border-primary ring-2 ring-primary/30" :"border-border"
 }`}
 style={{ background: c }}
 aria-label={`Color ${c}`}
 />
 ))}
 </div>
 <Input
 value={color}
 onChange={(e) => setColor(e.target.value)}
 placeholder="oklch(...) or #hex"
 className="mt-2 font-mono text-xs"
 />
 </div>
 {/* Preview */}
 <div className="rounded-lg border p-3">
 <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Preview</div>
 <Badge
 variant="secondary"
 style={{
 background: color ? `${color}25` : undefined,
 color: color ||"oklch(0.55 0.02 350)",
 }}
 >
 <div
 className="mr-1.5 h-2 w-2 rounded-full"
 style={{ background: color ||"oklch(0.85 0.05 350)" }}
 />
 {name ||"Category name"}
 </Badge>
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
 <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmit}>
 {category ?"Save changes" :"Create category"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
