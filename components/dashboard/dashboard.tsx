"use client"

import { useState } from "react"
import { useProfile } from "@/hooks/use-profile"
import { useNotifications } from "@/hooks/use-notifications"
import { roleLabels } from "@/lib/mock-data"
import { Sidebar, type ViewId } from "./sidebar"
import { OverviewView } from "./overview-view"
import { EventsView } from "./events-view"
import { StreakView } from "./streak-view"
import { RewardsView } from "./rewards-view"
import { CafeteriaView } from "./cafeteria-view"
import { OpportunitiesView } from "./opportunities-view"
import { ManagementView } from "./management-view"
import { MembersView } from "./members-view"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, Flame, ChevronDown, Bell } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<ViewId>("overview")
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { profile, loading } = useProfile()
  const { notifications, unreadCount, markAllRead } = useNotifications()

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  function renderView() {
    switch (view) {
      case "overview":   return <OverviewView onNavigate={setView} />
      case "events":     return <EventsView />
      case "streak":     return <StreakView />
      case "rewards":    return <RewardsView />
      case "cafeteria":  return <CafeteriaView />
      case "opportunities": return <OpportunitiesView />
      case "management": return <ManagementView />
      case "members":    return <MembersView />
      default:           return <OverviewView onNavigate={setView} />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        role={profile.role}
        active={view}
        onSelect={setView}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        userName={profile.name}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </Button>
            <Badge className="gap-1 border-0 bg-accent/20 text-accent-foreground hover:bg-accent/20">
              <Flame className="size-3.5" /> {profile.streak} sem
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Notificaciones */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notificaciones"
              className="relative"
              onClick={() => { setNotifOpen(true); markAllRead() }}
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            {/* Rol del usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <span className="hidden sm:inline">Rol:</span>
                  <span className="font-medium">{roleLabels[profile.role]}</span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{profile.name}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{profile.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{renderView()}</div>
        </main>
      </div>

      {/* Panel de notificaciones */}
      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Notificaciones</SheetTitle>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
            <div className="space-y-3 pr-4">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sin notificaciones</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-lg border p-3 text-sm ${
                      n.read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                    }`}
                  >
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
