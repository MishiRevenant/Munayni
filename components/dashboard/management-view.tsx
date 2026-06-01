"use client"

import type React from "react"
import { useState } from "react"
import type { CurrentUser } from "@/lib/types"
import { events as seedEvents, categoryLabels } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Users, CalendarDays, Settings2 } from "lucide-react"

interface ManagedEvent {
  id: string
  title: string
  category: string
  date: string
  enrolled: number
  capacity: number
  status: string
}

export function ManagementView({ user }: { user: CurrentUser }) {
  const [list, setList] = useState<ManagedEvent[]>(
    seedEvents.map((e) => ({
      id: e.id,
      title: e.title,
      category: categoryLabels[e.category],
      date: e.date,
      enrolled: e.enrolled,
      capacity: e.capacity,
      status: e.status,
    })),
  )
  const [open, setOpen] = useState(false)

  function createEvent(form: { title: string; category: string; date: string; capacity: string }) {
    const newEvent: ManagedEvent = {
      id: `ev-${Date.now()}`,
      title: form.title || "Nuevo evento",
      category: form.category || "Limpieza",
      date: form.date || "Por definir",
      enrolled: 0,
      capacity: Number(form.capacity) || 30,
      status: "abierto",
    }
    setList((prev) => [newEvent, ...prev])
    setOpen(false)
    toast.success("Evento creado", { description: newEvent.title })
  }

  function remove(id: string, title: string) {
    setList((prev) => prev.filter((e) => e.id !== id))
    toast("Evento eliminado", { description: title })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Gestión de Eventos</h1>
          <p className="mt-1 text-muted-foreground">
            {user.role === "admin"
              ? "Como administrador puedes crear, editar y eliminar cualquier evento."
              : "Como líder ambiental, organiza eventos junto a la administración."}
          </p>
        </div>
        <CreateEventDialog open={open} setOpen={setOpen} onCreate={createEvent} />
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={CalendarDays} label="Eventos activos" value={list.filter((e) => e.status !== "finalizado").length} />
        <SummaryCard icon={Users} label="Inscripciones totales" value={list.reduce((a, e) => a + e.enrolled, 0)} />
        <SummaryCard icon={Settings2} label="Cupos disponibles" value={list.reduce((a, e) => a + (e.capacity - e.enrolled), 0)} />
      </div>

      {/* Event table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Evento</th>
                <th className="px-5 py-3 font-medium">Categoría</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Inscritos</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{e.title}</td>
                  <td className="px-5 py-3 text-muted-foreground">{e.category}</td>
                  <td className="px-5 py-3 text-muted-foreground">{e.date}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {e.enrolled}/{e.capacity}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="secondary" className="capitalize">{e.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toast("Editor abierto", { description: e.title })}
                        aria-label="Editar"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => remove(e.id, e.title)}
                        aria-label="Eliminar"
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
  value: number
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

function CreateEventDialog({
  open,
  setOpen,
  onCreate,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  onCreate: (f: { title: string; category: string; date: string; capacity: string }) => void
}) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Limpieza")
  const [date, setDate] = useState("")
  const [capacity, setCapacity] = useState("30")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Crear evento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo evento</DialogTitle>
          <DialogDescription>Completa los datos para publicar un nuevo evento ambiental.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ev-title">Título</Label>
            <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Limpieza de playa" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Limpieza">Limpieza</SelectItem>
                  <SelectItem value="Reforestación">Reforestación</SelectItem>
                  <SelectItem value="Reciclaje">Reciclaje</SelectItem>
                  <SelectItem value="Taller">Taller</SelectItem>
                  <SelectItem value="Educación">Educación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-cap">Cupo</Label>
              <Input id="ev-cap" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-date">Fecha</Label>
            <Input id="ev-date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Sáb 28 Jun · 09:00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-desc">Descripción</Label>
            <Textarea id="ev-desc" placeholder="Describe la actividad..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={() => onCreate({ title, category, date, capacity })}>Publicar evento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
