"use client"

import type React from "react"
import { useState } from "react"
import type { Member, Role } from "@/lib/types"
import { members as seedMembers, roleLabels } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Users, Flame, Crown, Search, Trash2, ShieldCheck } from "lucide-react"

const roleBadge: Record<Role, string> = {
  usuario: "bg-secondary text-secondary-foreground",
  lider: "bg-primary/10 text-primary",
  admin: "bg-accent/20 text-accent-foreground",
}

export function MembersView() {
  const [list, setList] = useState<Member[]>(seedMembers)
  const [query, setQuery] = useState("")

  const filtered = list.filter(
    (m) => m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase()),
  )

  function changeRole(id: string, role: Role) {
    setList((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
    toast.success("Rol actualizado", { description: roleLabels[role] })
  }

  function remove(id: string, name: string) {
    setList((prev) => prev.filter((m) => m.id !== id))
    toast("Miembro eliminado", { description: name })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Miembros</h1>
        <p className="mt-1 text-muted-foreground">
          Panel de administración: gestiona roles, asigna líderes y supervisa la comunidad.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={Users} label="Miembros totales" value={list.length} />
        <SummaryCard icon={Crown} label="Líderes ambientales" value={list.filter((m) => m.role === "lider").length} />
        <SummaryCard icon={Flame} label="Racha promedio" value={`${Math.round(list.reduce((a, m) => a + m.streak, 0) / list.length)} sem`} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Miembro</th>
                <th className="px-5 py-3 font-medium">Racha</th>
                <th className="px-5 py-3 font-medium">Puntos</th>
                <th className="px-5 py-3 font-medium">Eventos</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Flame className="size-4 text-accent-foreground" /> {m.streak}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{m.points.toLocaleString()}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.eventsAttended}</td>
                  <td className="px-5 py-3">
                    <Select value={m.role} onValueChange={(v) => changeRole(m.id, v as Role)}>
                      <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usuario">Miembro</SelectItem>
                        <SelectItem value="lider">Líder Ambiental</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Badge className={`border-0 ${roleBadge[m.role]}`}>
                        {m.role === "admin" && <ShieldCheck className="size-3" />}
                        {roleLabels[m.role]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => remove(m.id, m.name)}
                        aria-label="Eliminar miembro"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <Card className="flex items-center gap-3 p-5">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
