"use client"

import { useState } from"react"
import { useAuth } from"@/store/auth"
import { useNav } from"@/store/nav"
import { apiPost } from"@/lib/api-client"
import { DEFAULT_ADMIN } from"@/lib/constants"
import { Button } from"@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import { Sparkles, Loader2, Lock, Mail, ChevronLeft, ShieldCheck } from"lucide-react"
import { toast } from"sonner"
import { useLang } from"@/store/lang"

export function AdminLoginPage() {
 const navigate = useNav((s) => s.navigate)
 const fetchMe = useAuth((s) => s.fetchMe)
 const t = useLang((s) => s.t)
 const [email, setEmail] = useState(DEFAULT_ADMIN.email)
 const [password, setPassword] = useState(DEFAULT_ADMIN.password)
 const [loading, setLoading] = useState(false)

 const handleLogin = async () => {
 setLoading(true)
 try {
 await apiPost("/api/auth/login", { email, password })
 await fetchMe()
 toast.success(t("nav.welcomeBackAdmin"))
 navigate({ name:"admin_dashboard" })
 } catch (err) {
 toast.error(err instanceof Error ? err.message : t("nav.loginFailed"))
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-blush">
 <div className="w-full max-w-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => navigate({ name:"home" })}
 className="mb-4"
 >
 <ChevronLeft className="me-1 h-4 w-4" />
 {t("nav.backToWebsite")}
 </Button>

 <Card className="border-outline-variant shadow-lg">
 <CardHeader className="space-y-2 text-center">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary">
 <ShieldCheck className="h-7 w-7" />
 </div>
 <CardTitle className="text-2xl">{t("nav.adminPortal")}</CardTitle>
 <CardDescription>
 {t("nav.adminLoginSubtitle")}
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="email" className="flex items-center gap-1.5">
 <Mail className="h-3.5 w-3.5" />
 {t("common.email")}
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
 {t("common.password")}
 </Label>
 <Input
 id="password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 onKeyDown={(e) => e.key ==="Enter" && handleLogin()}
 />
 </div>
 <Button
 className="w-full bg-primary"
 onClick={handleLogin}
 disabled={loading}
 >
 {loading ? (
 <>
 <Loader2 className="me-2 h-4 w-4 animate-spin" />
 {t("nav.signingIn")}
 </>
 ) : (
 <>
 <Sparkles className="me-2 h-4 w-4" />
 {t("nav.signIn")}
 </>
 )}
 </Button>

 <div className="rounded-md bg-blush p-3 text-xs text-secondary">
 <strong className="font-semibold">{t("nav.demoCredentials")}</strong>
 <br />
 {t("common.email")}: <code className="rounded bg-white px-1">{DEFAULT_ADMIN.email}</code>
 <br />
 {t("common.password")}: <code className="rounded bg-white px-1">{DEFAULT_ADMIN.password}</code>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 )
}
