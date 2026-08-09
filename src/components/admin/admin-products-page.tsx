"use client"

import { useState } from"react"
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query"
import { apiGet, apiPost, apiPut, apiDelete } from"@/lib/api-client"
import { formatMoney } from"@/lib/format"
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
 Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from"@/components/ui/dialog"
import {
 AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
 AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from"@/components/ui/alert-dialog"
import {
 Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from"@/components/ui/table"
import { Plus, Edit, Trash2, Package, Search, AlertTriangle, Leaf, Minus, Settings, ArrowRight } from "lucide-react"
import { toast } from"sonner"
import { ImageUpload } from"@/components/shared/image-upload"
import { useNav } from"@/store/nav"

interface Category {
 id: string
 name: string
}

interface Product {
 id: string
 name: string
 description: string | null
 price: number
 cost: number
 stock: number
 lowStockAt: number
 imageUrl: string | null
 categoryId: string | null
 active: boolean
 category: Category | null
}

export function AdminProductsPage() {
 const queryClient = useQueryClient()
 const navigate = useNav((s) => s.navigate)
 const [q, setQ] = useState("")
 const [filterCat, setFilterCat] = useState("all")
 const [showLowOnly, setShowLowOnly] = useState(false)
 const [createOpen, setCreateOpen] = useState(false)
 const [editP, setEditP] = useState<Product | null>(null)
 const [deleteP, setDeleteP] = useState<Product | null>(null)

 const { data, isLoading } = useQuery({
 queryKey: ["products","all"],
 queryFn: () => apiGet<{ products: Product[] }>("/api/products"),
 })
 const { data: catData } = useQuery({
 queryKey: ["categories"],
 queryFn: () => apiGet<{ categories: Category[] }>("/api/categories"),
 })

 const products = (data?.products || [])
 .filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()))
 .filter((p) => filterCat ==="all" || p.category?.id === filterCat)
 .filter((p) => !showLowOnly || p.stock <= p.lowStockAt)

 const createMutation = useMutation({
 mutationFn: (body: Record<string, unknown>) => apiPost("/api/products", body),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["products"] })
 toast.success("Product created")
 setCreateOpen(false)
 },
 onError: (err: Error) => toast.error(err.message),
 })

 const updateMutation = useMutation({
 mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
 apiPut(`/api/products/${id}`, body),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["products"] })
 toast.success("Product updated")
 setEditP(null)
 },
 onError: (err: Error) => toast.error(err.message),
 })

 const deleteMutation = useMutation({
 mutationFn: (id: string) => apiDelete(`/api/products/${id}`),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["products"] })
 toast.success("Product removed")
 setDeleteP(null)
 },
 onError: (err: Error) => toast.error(err.message),
 })

 const quickStockUpdate = (p: Product, delta: number) => {
 const newStock = Math.max(0, p.stock + delta)
 updateMutation.mutate({ id: p.id, body: { stock: newStock } })
 }

 return (
 <div className="space-y-6">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <div className="mb-2 flex items-center gap-2">
 <span className="h-px w-8 bg-primary" aria-hidden />
 <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
 Catalog
 </span>
 </div>
 <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Products & Inventory</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Manage products, prices, and stock levels. Stock auto-decreases on orders.
 </p>
 </div>
 <div className="flex gap-2">
 <Button
 variant="outline"
 onClick={() => navigate({ name: "admin_product_categories" })}
 className="press-feedback border-outline-variant text-secondary hover:border-primary hover:bg-blush hover:text-primary"
 >
 <Settings className="mr-1.5 h-4 w-4" />
 Manage Categories
 <ArrowRight className="arrow-slide ml-1.5 h-3.5 w-3.5" />
 </Button>
 <Button onClick={() => setCreateOpen(true)} className="btn-press bg-primary hover:bg-primary/90">
 <Plus className="mr-1.5 h-4 w-4" />
 New Product
 </Button>
 </div>
 </div>

 <div className="flex flex-wrap gap-2">
 <div className="relative flex-1 min-w-48">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search products..."
 value={q}
 onChange={(e) => setQ(e.target.value)}
 className="pl-9"
 />
 </div>
 <Select value={filterCat} onValueChange={setFilterCat}>
 <SelectTrigger className="w-40">
 <SelectValue placeholder="All categories" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All categories</SelectItem>
 {(catData?.categories || []).map((c) => (
 <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 <Button
 variant={showLowOnly ?"default" :"outline"}
 onClick={() => setShowLowOnly(!showLowOnly)}
 className={showLowOnly ?"bg-primary hover:bg-primary" :""}
 >
 <AlertTriangle className="mr-1.5 h-4 w-4" />
 Low stock only
 </Button>
 </div>

 <Card>
 <CardContent className="p-0">
 {isLoading ? (
 <div className="h-64 shimmer" />
 ) : products.length === 0 ? (
 <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
 <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
 <div className="absolute inset-0 rounded-full bg-blush-strong/40 blur-xl" aria-hidden />
 <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 ring-1 ring-primary/15 shadow-sm">
 <Package className="h-6 w-6 text-primary" />
 </div>
 </div>
 <p className="mt-4 text-sm font-medium">No products found</p>
 <p className="mt-1 text-xs text-muted-foreground">
 Add your first product or adjust filters to see inventory here.
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Product</TableHead>
 <TableHead>Category</TableHead>
 <TableHead className="text-right">Price</TableHead>
 <TableHead className="text-center">Stock</TableHead>
 <TableHead className="text-center">Status</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {products.map((p) => {
 const isLow = p.stock <= p.lowStockAt
 return (
 <TableRow key={p.id}>
 <TableCell>
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-blush">
 {p.imageUrl ? (
 
 <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
 ) : (
 <div className="flex h-full items-center justify-center text-primary-container">
 <Leaf className="h-5 w-5" />
 </div>
 )}
 </div>
 <div className="min-w-0">
 <div className="truncate font-medium">{p.name}</div>
 <div className="truncate text-xs text-muted-foreground">
 Cost: {formatMoney(p.cost)}
 </div>
 </div>
 </div>
 </TableCell>
 <TableCell>
 {p.category ? (
 <Badge variant="outline">{p.category.name}</Badge>
 ) : (
 <span className="text-xs text-muted-foreground">—</span>
 )}
 </TableCell>
 <TableCell className="text-right font-medium">
 {formatMoney(p.price)}
 </TableCell>
 <TableCell className="text-center">
 <div className="flex items-center justify-center gap-1">
 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8"
 onClick={() => quickStockUpdate(p, -1)}
 disabled={p.stock === 0}
 aria-label="Decrease stock"
 >
 <Minus className="h-3 w-3" />
 </Button>
 <Badge
 className={isLow ?"bg-blush-strong text-secondary" :"bg-blush text-primary"}
 variant="secondary"
 >
 {p.stock}
 </Badge>
 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8"
 onClick={() => quickStockUpdate(p, 1)}
 aria-label="Increase stock"
 >
 <Plus className="h-3 w-3" />
 </Button>
 </div>
 {isLow && (
 <div className="text-[10px] text-primary">
 Low (≤{p.lowStockAt})
 </div>
 )}
 </TableCell>
 <TableCell className="text-center">
 <Switch
 checked={p.active}
 onCheckedChange={() =>
 updateMutation.mutate({ id: p.id, body: { active: !p.active } })
 }
 />
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-1">
 <Button
 variant="ghost"
 size="icon"
 className="h-9 w-9"
 onClick={() => setEditP(p)}
 aria-label="Edit product"
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 className="h-9 w-9 text-primary"
 onClick={() => setDeleteP(p)}
 aria-label="Delete product"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 )
 })}
 </TableBody>
 </Table>
 </div>
 )}
 </CardContent>
 </Card>

 {/* Create dialog */}
 <ProductFormDialog
 open={createOpen}
 onOpenChange={setCreateOpen}
 categories={catData?.categories || []}
 onSubmit={(body) => createMutation.mutate(body)}
 />

 {/* Edit dialog */}
 {editP && (
 <ProductFormDialog
 open
 onOpenChange={(o) => !o && setEditP(null)}
 product={editP}
 categories={catData?.categories || []}
 onSubmit={(body) => updateMutation.mutate({ id: editP.id, body })}
 />
 )}

 {/* Delete */}
 <AlertDialog open={!!deleteP} onOpenChange={(o) => !o && setDeleteP(null)}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Delete product?</AlertDialogTitle>
 <AlertDialogDescription>
 <strong>{deleteP?.name}</strong> will be removed.
 If it has orders, it will be deactivated instead.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Cancel</AlertDialogCancel>
 <AlertDialogAction
 className="bg-primary hover:bg-primary/90"
 onClick={() => deleteP && deleteMutation.mutate(deleteP.id)}
 >
 Delete
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 )
}

function ProductFormDialog({
 open, onOpenChange, product, categories, onSubmit,
}: {
 open: boolean
 onOpenChange: (v: boolean) => void
 product?: Product
 categories: Category[]
 onSubmit: (body: Record<string, unknown>) => void
}) {
 const navigate = useNav((s) => s.navigate)
 const [name, setName] = useState(product?.name || "")
 const [description, setDescription] = useState(product?.description || "")
 const [price, setPrice] = useState(product?.price?.toString() || "")
 const [cost, setCost] = useState(product?.cost?.toString() || "0")
 const [stock, setStock] = useState(product?.stock?.toString() || "0")
 const [lowStockAt, setLowStockAt] = useState(product?.lowStockAt?.toString() || "5")
 const [imageUrl, setImageUrl] = useState(product?.imageUrl || "")
 const [categoryId, setCategoryId] = useState(product?.categoryId || "")
 const [active, setActive] = useState(product?.active ?? true)

 const handleSubmit = () => {
 if (!name.trim()) {
 toast.error("Name is required")
 return
 }
 const p = parseFloat(price)
 if (!price.trim() || Number.isNaN(p) || p < 0) {
 toast.error("Valid price is required")
 return
 }
 onSubmit({
 name: name.trim(),
 description: description || null,
 price: p,
 cost: parseFloat(cost) || 0,
 stock: parseInt(stock) || 0,
 lowStockAt: parseInt(lowStockAt) || 5,
 imageUrl: imageUrl || null,
 categoryId: categoryId || null,
 active,
 })
 }

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle className="font-serif text-xl font-bold">{product ? "Edit Product" : "New Product"}</DialogTitle>
 <DialogDescription>
 Product details, pricing, and inventory settings.
 </DialogDescription>
 </DialogHeader>
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">Name <span className="text-primary">*</span></Label>
 <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Soothing Aloe Gel" className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card" />
 </div>
 <div className="space-y-2">
 <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">Description</Label>
 <Textarea
 rows={2}
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="Brief description of the product..."
 className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"
 />
 </div>
 {/* Product Image Upload */}
 <ImageUpload
 value={imageUrl}
 onChange={setImageUrl}
 label="Product Image"
 />
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-2">
 <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">Price ($) <span className="text-primary">*</span></Label>
 <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card" />
 </div>
 <div className="space-y-2">
 <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">Cost ($)</Label>
 <Input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card" />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-2">
 <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">Stock</Label>
 <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card" />
 </div>
 <div className="space-y-2">
 <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">Low stock alert at</Label>
 <Input type="number" min="0" value={lowStockAt} onChange={(e) => setLowStockAt(e.target.value)} className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card" />
 </div>
 </div>
 {/* Category - with Manage link */}
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <Label className="text-xs font-semibold uppercase tracking-wider text-secondary">Category</Label>
 <button
 type="button"
 onClick={() => { onOpenChange(false); navigate({ name: "admin_product_categories" }) }}
 className="text-[10px] font-semibold uppercase tracking-wider text-primary hover:text-secondary"
 >
 + Manage
 </button>
 </div>
 {categories.length === 0 ? (
 <div className="rounded-lg border border-dashed border-outline-variant/70 bg-blush p-4 text-center">
 <p className="text-xs text-muted-foreground">No categories yet.</p>
 <Button
 type="button"
 variant="outline"
 size="sm"
 className="press-feedback mt-2 border-primary text-primary hover:bg-primary hover:text-white"
 onClick={() => { onOpenChange(false); navigate({ name: "admin_product_categories" }) }}
 >
 Create Categories First
 <ArrowRight className="arrow-slide ml-1.5 h-3 w-3" />
 </Button>
 </div>
 ) : (
 <Select value={categoryId} onValueChange={setCategoryId}>
 <SelectTrigger className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"><SelectValue placeholder="Uncategorized" /></SelectTrigger>
 <SelectContent>
 {categories.map((c) => (
 <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 )}
 </div>
 <div className="flex items-center justify-between rounded-lg border border-outline-variant/60 bg-blush/30 p-3">
 <div>
 <div className="text-sm font-medium text-foreground">Active</div>
 <div className="text-xs text-muted-foreground">Inactive products are hidden from shop</div>
 </div>
 <Switch checked={active} onCheckedChange={setActive} />
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" className="press-feedback" onClick={() => onOpenChange(false)}>Cancel</Button>
 <Button className="btn-press bg-primary hover:bg-primary/90" onClick={handleSubmit}>
 {product ? "Save changes" : "Create product"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
