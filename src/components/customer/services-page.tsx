"use client"

import { useQuery } from "@tanstack/react-query"
import { useNav } from "@/store/nav"
import { apiGet } from "@/lib/api-client"
import { formatMoney } from "@/lib/format"
import { SERVICE_CATEGORIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Search, ArrowRight, Sparkles } from "lucide-react"
import { useState } from "react"

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  durationMin: number
  category: string
  active: boolean
}

export function ServicesPage() {
  const navigate = useNav((s) => s.navigate)
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<string>("All")

  const { data, isLoading } = useQuery({
    queryKey: ["services", "active"],
    queryFn: () => apiGet<{ services: Service[] }>("/api/services?active=true"),
  })

  const services = data?.services || []
  const filtered = services.filter((s) => {
    if (cat !== "All" && s.category !== cat) return false
    if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 bg-rose-100 text-rose-700">
          Our Treatments
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Beauty Services</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          From laser hair removal to advanced facials, every treatment is performed by certified
          specialists using state-of-the-art equipment.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {["All", ...SERVICE_CATEGORIES].map((c) => (
            <Button
              key={c}
              size="sm"
              variant={cat === c ? "default" : "outline"}
              onClick={() => setCat(c)}
              className={cat === c ? "bg-rose-500 hover:bg-rose-600" : ""}
            >
              {c}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search treatments..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><div className="h-5 w-1/2 shimmer rounded" /></CardHeader>
              <CardContent>
                <div className="h-3 w-full shimmer rounded" />
                <div className="mt-2 h-3 w-2/3 shimmer rounded" />
              </CardContent>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            No services found. Try a different search.
          </div>
        ) : (
          filtered.map((svc) => (
            <Card
              key={svc.id}
              className="card-hover group relative flex flex-col gap-0 overflow-hidden rounded-2xl border-rose-100/70 py-0 shadow-sm transition-all duration-300 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/10"
            >
              <CardHeader className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-rose-50 to-amber-50/50 p-5 pb-4">
                {/* Decorative orb */}
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-rose-300/40 via-rose-200/30 to-amber-200/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden
                />
                <Sparkles
                  className="pointer-events-none absolute right-4 top-4 h-5 w-5 text-rose-400/40 transition-colors group-hover:text-rose-400/70"
                  aria-hidden
                />
                <div className="relative flex items-start justify-between gap-3">
                  <Badge
                    variant="outline"
                    className="border-white/60 bg-white/70 px-2.5 py-1 text-xs font-medium text-rose-700 shadow-sm backdrop-blur-md"
                  >
                    {svc.category}
                  </Badge>
                  <div className="text-right">
                    <div className="text-gradient-rose text-2xl font-bold tracking-tight">
                      {formatMoney(svc.price)}
                    </div>
                    <div className="mt-0.5 flex items-center justify-end gap-1 text-xs text-rose-700/70">
                      <Clock className="h-3 w-3" />
                      {svc.durationMin} min
                    </div>
                  </div>
                </div>
                <CardTitle className="relative mt-3 text-xl font-semibold tracking-tight transition-colors group-hover:text-rose-700">
                  {svc.name}
                </CardTitle>
                {svc.description && (
                  <CardDescription className="relative mt-1.5 line-clamp-3 leading-relaxed">
                    {svc.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter className="flex gap-2 p-5 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-rose-200/70 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                  onClick={() => navigate({ name: "service_detail", serviceId: svc.id })}
                >
                  Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 shadow-sm shadow-rose-500/20 transition-all hover:from-rose-600 hover:to-rose-700 hover:shadow-md hover:shadow-rose-500/30"
                  onClick={() => navigate({ name: "booking", serviceId: svc.id })}
                >
                  <Calendar className="mr-1.5 h-4 w-4" />
                  Book
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
