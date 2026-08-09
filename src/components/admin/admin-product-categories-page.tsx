"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNav } from "@/store/nav"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Tag, Search, Package, ArrowRight, Hash } from "lucide-react"
import { toast } from "sonner"
import { Reveal } from "@/components/shared/reveal"

interface ProductCategory {
  id: string
  name: string
  createdAt: string
  _count?: { products: number }
}

export function AdminProductCategoriesPage() {
  const queryClient = useQueryClient()
  const navigate = useNav((s) => s.navigate)
  const [q, setQ] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editCat, setEditCat] = useState<ProductCategory | null>(null)
  const [deleteCat, setDeleteCat] = useState<ProductCategory | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<{ categories: ProductCategory[] }>("/api/categories"),
  })

  const categories = (data?.categories || []).filter(
    (c) => !q || c.name.toLowerCase().includes(q.toLowerCase())
  )

  const createMutation = useMutation({
    mutationFn: (body: { name: string }) => apiPost("/api/categories", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category created")
      setCreateOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name: string } }) =>
      apiPut(`/api/categories/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Category updated")
      setEditCat(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category deleted")
      setDeleteCat(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const totalCount = data?.categories?.length || 0
  const totalProducts = (data?.categories || []).reduce((sum, c) => sum + (c._count?.products || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-8 bg-primary" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Catalog
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Product Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize products into categories. Customers can filter the shop page by these.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="btn-press bg-primary hover:bg-primary/90">
          <Plus className="mr-1.5 h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-outline-variant/70 bg-card p-5 shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blush">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalCount}</div>
              <div className="text-xs text-muted-foreground">Total Categories</div>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-outline-variant/70 bg-card p-5 shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blush">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
              <div className="text-xs text-muted-foreground">Linked Products</div>
            </div>
          </div>
        </Card>
        <Card className="col-span-2 rounded-2xl border-outline-variant/70 bg-blush p-5 shadow-none sm:col-span-1">
          <button
            onClick={() => navigate({ name: "admin_products" })}
            className="press-feedback flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">Manage Products</div>
                <div className="text-xs text-muted-foreground">View all products</div>
              </div>
            </div>
          </button>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border-outline-variant bg-card pl-9 focus-visible:border-primary"
        />
      </div>

      {/* Categories grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-48 rounded-2xl border-outline-variant/70">
              <div className="h-full shimmer rounded-2xl" />
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-outline-variant/70 bg-blush p-16">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary-container/20 blur-2xl" aria-hidden />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-primary/15 shadow-sm backdrop-blur-sm">
            <Tag className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold tracking-tight">
            {q ? "No categories found" : "No categories yet"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {q ? "Try a different search." : "Create your first category to organize products."}
          </p>
          {!q && (
            <Button
              className="btn-press mt-5 bg-primary hover:bg-primary/90"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Category
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <Card className="card-lift group relative overflow-hidden rounded-2xl border-outline-variant/70 bg-card py-0 shadow-none transition-all duration-300 hover:border-primary">
                {/* Color accent bar at top */}
                <div className="h-1.5 w-full bg-primary" />

                <CardContent className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blush">
                        <Tag className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold tracking-tight text-foreground">
                          {c.name}
                        </h3>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          {c._count?.products || 0} {(c._count?.products || 0) === 1 ? "product" : "products"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Created date */}
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="h-3 w-3" />
                    Created {new Date(c.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex gap-2 border-t border-outline-variant/60 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="press-feedback flex-1 border-outline-variant text-secondary hover:border-primary hover:bg-primary hover:text-white"
                      onClick={() => setEditCat(c)}
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="press-feedback flex-1 border-outline-variant text-secondary hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setDeleteCat(c)}
                      disabled={(c._count?.products || 0) > 0}
                      title={(c._count?.products || 0) > 0 ? "Reassign products first" : "Delete"}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      )}

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
          </AlertDialogHeader>
          <AlertDialogDescription>
            <strong>{deleteCat?.name}</strong> will be permanently removed.
            Products using this category will become uncategorized.
          </AlertDialogDescription>
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
  category?: ProductCategory
  onSubmit: (body: { name: string }) => void
}) {
  const [name, setName] = useState(category?.name || "")

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    onSubmit({ name: name.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold">
            {category ? "Edit Category" : "New Product Category"}
          </DialogTitle>
          <DialogDescription>
            Categories help group products (e.g. Skincare, Devices, Accessories).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name" className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Name <span className="text-primary">*</span>
            </Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Skincare"
              className="border-outline-variant bg-blush/50 focus:border-primary focus:bg-card"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="press-feedback" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="btn-press bg-primary hover:bg-primary/90" onClick={handleSubmit}>
            {category ? "Save changes" : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
