"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Package, Search, AlertTriangle, Leaf } from "lucide-react"
import { toast } from "sonner"

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
  active: boolean
  category: Category | null
}

export function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [q, setQ] = useState("")
  const [filterCat, setFilterCat] = useState("all")
  const [showLowOnly, setShowLowOnly] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editP, setEditP] = useState<Product | null>(null)
  const [deleteP, setDeleteP] = useState<Product | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => apiGet<{ products: Product[] }>("/api/products"),
  })
  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<{ categories: Category[] }>("/api/categories"),
  })

  const products = (data?.products || [])
    .filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()))
    .filter((p) => filterCat === "all" || p.category?.id === filterCat)
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products & Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage products, prices, and stock levels. Stock auto-decreases on orders.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-rose-500 hover:bg-rose-600">
          <Plus className="mr-1.5 h-4 w-4" />
          New Product
        </Button>
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
          variant={showLowOnly ? "default" : "outline"}
          onClick={() => setShowLowOnly(!showLowOnly)}
          className={showLowOnly ? "bg-amber-500 hover:bg-amber-600" : ""}
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
            <div className="flex flex-col items-center justify-center py-16">
              <Package className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No products found.</p>
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
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-rose-50">
                              {p.imageUrl ? (
                                 
                                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-rose-300">
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
                              className="h-6 w-6"
                              onClick={() => quickStockUpdate(p, -1)}
                              disabled={p.stock === 0}
                            >
                              −
                            </Button>
                            <Badge
                              className={isLow ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}
                              variant="secondary"
                            >
                              {p.stock}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => quickStockUpdate(p, 1)}
                            >
                              +
                            </Button>
                          </div>
                          {isLow && (
                            <div className="text-[10px] text-amber-600">
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
                              className="h-9 w-9 text-rose-600"
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
        onSubmit={(body) => createMutation.mutate({ body })}
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
              className="bg-rose-500 hover:bg-rose-600"
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
  const [name, setName] = useState(product?.name || "")
  const [description, setDescription] = useState(product?.description || "")
  const [price, setPrice] = useState(product?.price.toString() || "")
  const [cost, setCost] = useState(product?.cost.toString() || "0")
  const [stock, setStock] = useState(product?.stock.toString() || "0")
  const [lowStockAt, setLowStockAt] = useState(product?.lowStockAt.toString() || "5")
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "")
  const [categoryId, setCategoryId] = useState(product?.categoryId || "")
  const [active, setActive] = useState(product?.active ?? true)

  const handleSubmit = () => {
    if (!name) {
      toast.error("Name is required")
      return
    }
    const p = parseFloat(price)
    if (Number.isNaN(p) || p < 0) {
      toast.error("Invalid price")
      return
    }
    onSubmit({
      name,
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
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
          <DialogDescription>
            Product details, pricing, and inventory settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Soothing Aloe Gel" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cost ($)</Label>
              <Input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Low stock alert at</Label>
              <Input type="number" min="0" value={lowStockAt} onChange={(e) => setLowStockAt(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Uncategorized" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">Active</div>
              <div className="text-xs text-muted-foreground">Inactive products are hidden from shop</div>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-rose-500 hover:bg-rose-600" onClick={handleSubmit}>
            {product ? "Save changes" : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
