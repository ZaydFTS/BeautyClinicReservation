"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"
import { formatDateTime } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings as SettingsIcon, ShieldCheck, Send } from "lucide-react"

export function AdminSettingsPage() {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      apiGet<{ logs: {
        id: string
        channel: string
        to: string
        subject: string
        message: string
        status: string
        error: string | null
        createdAt: string
      }[] }>("/api/notifications"),
  })

  const logs = data?.logs || []
  const telegramConfigured = typeof window !== "undefined"
    ? false // determined server-side, show generic info
    : false

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure clinic-wide settings and integrations.
        </p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-rose-500" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Admin-only notifications for new appointments, orders, and low stock.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Telegram Bot</div>
                <div className="text-sm text-muted-foreground">
                  Notifications sent to admin chat via Telegram Bot API
                </div>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Configured server-side
              </Badge>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <strong>To enable:</strong> Set these environment variables:
              <pre className="mt-2 rounded bg-muted p-2 text-[11px] overflow-x-auto">
{`TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_chat_id`}
              </pre>
              Get a bot token from{" "}
              <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-rose-600 underline">
                @BotFather
              </a>{" "}
              and your chat ID from{" "}
              <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-rose-600 underline">
                @userinfobot
              </a>.
            </div>
          </div>

          {/* Recent notifications */}
          <div>
            <div className="mb-2 text-sm font-semibold">Recent Notifications (last 50)</div>
            {logs.length === 0 ? (
              <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                No notifications sent yet
              </div>
            ) : (
              <div className="max-h-96 space-y-1 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-md border p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.channel}</Badge>
                        <span className="font-medium">{log.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {formatDateTime(log.createdAt)}
                        </span>
                        <Badge
                          variant="secondary"
                          className={
                            log.status === "SENT"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }
                        >
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-1 text-muted-foreground whitespace-pre-wrap">
                      {log.message}
                    </div>
                    {log.error && (
                      <div className="mt-1 text-rose-600">
                        <strong>Error:</strong> {log.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-rose-500" />
            Security
          </CardTitle>
          <CardDescription>
            Authentication and access control settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="font-medium">Admin Session</div>
              <div className="text-xs text-muted-foreground">
                Cookie-based, HTTP-only, 7-day expiry
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="font-medium">Protected Routes</div>
              <div className="text-xs text-muted-foreground">
                All /api/admin/* and admin dashboard pages require authentication
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              Enforced
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-rose-500" />
            System
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1 text-muted-foreground">
          <div><strong>Version:</strong> 1.0.0</div>
          <div><strong>Framework:</strong> Next.js 16 + Prisma + SQLite</div>
          <div><strong>Payment:</strong> Cash in clinic / COD (no online payment)</div>
          <div><strong>Inventory:</strong> Auto-decrement on order completion</div>
          <div><strong>Calendar:</strong> Admin-controlled slots only</div>
        </CardContent>
      </Card>
    </div>
  )
}
