"use client"

import type React from "react"
import type { Role } from "@/lib/types"
import { roleLabels } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Leaf,
  LayoutDashboard,
  CalendarDays,
  Flame,
  Gift,
  Coffee,
  Briefcase,
  Settings2,
  Users,
  LogOut,
  X,
} from "lucide-react"

export type ViewId =
  | "overview"
  | "events"
  | "streak"
  | "rewards"
  | "cafeteria"
  | "opportunities"
  | "management"
  | "members"

const roleRank: Record<Role, number> = { usuario: 0, lider: 1, admin: 2 }

const navItems: { id: ViewId; label: string; icon: React.ElementType; minRole: Role }[] = [
  { id: "overview", label: "Inicio", icon: LayoutDashboard, minRole: "usuario" },
  { id: "events", label: "Eventos", icon: CalendarDays, minRole: "usuario" },
  { id: "streak", label: "Mi Racha", icon: Flame, minRole: "usuario" },
  { id: "rewards", label: "Recompensas", icon: Gift, minRole: "usuario" },
  { id: "cafeteria", label: "Cafetería Sostenible", icon: Coffee, minRole: "usuario" },
  { id: "opportunities", label: "Oportunidades", icon: Briefcase, minRole: "lider" },
  { id: "management", label: "Gestión de Eventos", icon: Settings2, minRole: "lider" },
  { id: "members", label: "Miembros", icon: Users, minRole: "admin" },
]

interface SidebarProps {
  role: Role
  active: ViewId
  onSelect: (v: ViewId) => void
  onLogout: () => void
  open: boolean
  onClose: () => void
  userName: string
}

export function Sidebar({ role, active, onSelect, onLogout, open, onClose, userName }: SidebarProps) {
  const visible = navItems.filter((i) => roleRank[role] >= roleRank[i.minRole])

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">Raíz Verde</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="Cerrar menú">
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {visible.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => {
                  onSelect(id)
                  onClose()
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
              {userName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{roleLabels[role]}</p>
            </div>
          </div>
          <Button variant="ghost" className="mt-1 w-full justify-start text-muted-foreground" onClick={onLogout}>
            <LogOut className="size-[18px]" />
            Cerrar sesión
          </Button>
        </div>
      </aside>
    </>
  )
}
