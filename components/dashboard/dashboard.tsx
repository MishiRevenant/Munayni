"use client"

import { useState } from "react"
import type { Role } from "@/lib/types"
import { users, roleLabels } from "@/lib/mock-data"
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
import { Badge } from "@/components/ui/badge"
import { Menu, Flame, ChevronDown, Bell } from "lucide-react"

export function Dashboard({
  role,
  onRoleChange,
  onLogout,
}: {
  role: Role
  onRoleChange: (r: Role) => void
  onLogout: () => void
}) {
  const [view, setView] = useState<ViewId>("overview")
  const [menuOpen, setMenuOpen] = useState(false)
  const user = users[role]

  function renderView() {
    switch (view) {
      case "overview":
        return <OverviewView user={user} onNavigate={setView} />
      case "events":
        return <EventsView user={user} />
      case "streak":
        return <StreakView user={user} />
      case "rewards":
        return <RewardsView user={user} />
      case "cafeteria":
        return <CafeteriaView user={user} />
      case "opportunities":
        return <OpportunitiesView />
      case "management":
        return <ManagementView user={user} />
      case "members":
        return <MembersView />
      default:
        return <OverviewView user={user} onNavigate={setView} />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        role={role}
        active={view}
        onSelect={setView}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        userName={user.name}
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
              <Flame className="size-3.5" /> {user.streak} sem
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notificaciones" className="relative">
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-accent" />
            </Button>

            {/* Demo role switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <span className="hidden sm:inline">Ver como:</span>
                  <span className="font-medium">{roleLabels[role]}</span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Cambiar perfil (demo)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["usuario", "lider", "admin"] as Role[]).map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => {
                      onRoleChange(r)
                      setView("overview")
                    }}
                  >
                    {roleLabels[r]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{renderView()}</div>
        </main>
      </div>
    </div>
  )
}
