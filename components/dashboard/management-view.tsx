"use client"

import { useState } from "react"
import { useEvents } from "@/hooks/use-events"
import type { EventCategory, Role } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import { CalendarDays, Plus, Image as ImageIcon, CheckCircle2, Lock, Trash2, Loader2 } from "lucide-react"

export function ManagementView() {
  const { events, loading, create, remove } = useEvents()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState<EventCategory>("limpieza")
  const [points, setPoints] = useState("50")
  const [capacity, setCapacity] = useState("30")
  const [minRole, setMinRole] = useState<Role>("usuario")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    const newEvent = {
      title, date, time, location, category, 
      points: parseInt(points, 10), 
      capacity: parseInt(capacity, 10), 
      minRole, description,
    }

    try {
      const res = await create(newEvent)
      if (res.ok) {
        toast.success("Evento creado exitosamente")
        setSheetOpen(false)
        resetForm()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error("Error al crear evento", { description: data.error })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setTitle("")
    setDate("")
    setTime("")
    setLocation("")
    setCategory("limpieza")
    setPoints("50")
    setCapacity("30")
    setMinRole("usuario")
    setDescription("")
  }

  async function handleDelete(id: string, eventTitle: string) {
    if (!confirm(`¿Eliminar evento "${eventTitle}"?`)) return
    setBusyId(id)
    try {
      const res = await remove(id)
      if (res.ok) {
        toast("Evento eliminado")
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error("Error al eliminar", { description: data.error })
      }
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Gestión de Eventos</h1>
          <p className="mt-1 text-muted-foreground">
            Crea, edita y supervisa las jornadas y talleres del colectivo.
          </p>
        </div>
        <Button onClick={() => setSheetOpen(true)} className="gap-2">
          <Plus className="size-4" /> Nuevo evento
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Evento</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Lugar</th>
                <th className="px-5 py-3 font-medium">Inscritos</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const isBusy = busyId === e.id
                return (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {e.minRole !== "usuario" && <Lock className="size-3 text-muted-foreground" />}
                        <span className="font-medium">{e.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-4" /> {e.date}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{e.location}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(e.enrolled / e.capacity) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {e.enrolled}/{e.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant="outline"
                        className={`border-0 ${
                          e.status === "abierto"
                            ? "bg-primary/10 text-primary"
                            : e.status === "lleno"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {e.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isBusy && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(e.id, e.title)}
                          disabled={isBusy}
                          aria-label="Eliminar evento"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Crear nuevo evento</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del evento</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Reforestación Cerro Sur"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Parque Central"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as EventCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limpieza">Limpieza</SelectItem>
                    <SelectItem value="reforestacion">Reforestación</SelectItem>
                    <SelectItem value="reciclaje">Reciclaje</SelectItem>
                    <SelectItem value="taller">Taller</SelectItem>
                    <SelectItem value="educacion">Educación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minRole">Rol mínimo</Label>
                <Select value={minRole} onValueChange={(v) => setMinRole(v as Role)}>
                  <SelectTrigger id="minRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Miembro</SelectItem>
                    <SelectItem value="lider">Líder Ambiental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Cupo máximo</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">Puntos</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  step="10"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles sobre el evento..."
                className="resize-none"
                rows={3}
                required
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <><CheckCircle2 className="size-4 mr-2" /> Crear evento</>
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
