"use client"

import { useState } from "react"
import { useAuth } from "@/store/auth"
import { useNav } from "@/store/nav"
import { apiPost } from "@/lib/api-client"
import { DEFAULT_ADMIN } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, Lock, Mail, ChevronLeft, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export function AdminLoginPage() {
  const navigate = useNav((s) => s.navigate)
  const fetchMe = useAuth((s) => s.fetchMe)
  const [email, setEmail] = useState(DEFAULT_ADMIN.email)
  const [password, setPassword] = useState(DEFAULT_ADMIN.password)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await apiPost("/api/auth/login", { email, password })
      await fetchMe()
      toast.success("Welcome back, admin!")
      navigate({ name: "admin_dashboard" })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-background to-amber-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ name: "home" })}
          className="mb-4"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to website
        </Button>

        <Card className="border-rose-100 shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              Sign in to manage appointments, products, and orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@clinic.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>

            <div className="rounded-md bg-rose-50 p-3 text-xs text-rose-700">
              <strong className="font-semibold">Demo credentials:</strong>
              <br />
              Email: <code className="rounded bg-white px-1">{DEFAULT_ADMIN.email}</code>
              <br />
              Password: <code className="rounded bg-white px-1">{DEFAULT_ADMIN.password}</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
