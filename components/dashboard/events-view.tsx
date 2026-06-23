"use client"

import { useMemo, useState } from "react"
import type { EventCategory } from "@/lib/types"
import { useEvents } from "@/hooks/use-events"
import { useProfile } from "@/hooks/use-profile"
import { categoryLabels } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { MapPin, Users, Star, Lock, Check, CalendarDays, Loader2 } from "lucide-react"
import type { Role } from "@/lib/types"

const roleRank: Record<Role, number> = { usuario: 0, lider: 1, admin: 2 }

const statusStyles: Record<string, string> = {
  abierto:      "bg-primary/10 text-primary",
  lleno:        "bg-destructive/10 text-destructive",
  proximamente: "bg-accent/20 text-accent-foreground",
  finalizado:   "bg-muted text-muted-foreground",
}

const statusLabels: Record<string, string> = {
  abierto:      "Abierto",
  lleno:        "Cupo lleno",
  proximamente: "Próximamente",
  finalizado:   "Finalizado",
}

const filters: { id: EventCategory | "todos"; label: string }[] = [
  { id: "todos",        label: "Todos" },
  { id: "limpieza",     label: "Limpieza" },
  { id: "reforestacion",label: "Reforestación" },
  { id: "reciclaje",    label: "Reciclaje" },
  { id: "taller",       label: "Taller" },
  { id: "educacion",    label: "Educación" },
]

export function EventsView() {
  const [filter, setFilter] = useState<EventCategory | "todos">("todos")
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const { profile } = useProfile()
  const { events: allEvents, enrolledIds, loading, enroll, unenroll } = useEvents(filter)

  const visible = useMemo(
    () => allEvents.filter((e) => filter === "todos" || e.category === filter),
    [allEvents, filter],
  )

  async function toggleEnroll(id: string, title: string) {
    if (!profile) return
    setEnrollingId(id)
    try {
      if (enrolledIds.has(id)) {
        const res = await unenroll(id)
        if (res.ok) toast("Inscripción cancelada", { description: title })
        else {
          const data = await res.json().catch(() => ({}))
          toast.error("Error", { description: data.error ?? "No se pudo cancelar" })
        }
      } else {
        const res = await enroll(id)
        if (res.ok) toast.success("¡Te inscribiste!", { description: title })
        else {
          const data = await res.json().catch(() => ({}))
          toast.error("Error", { description: data.error ?? "No se pudo inscribir" })
        }
      }
    } finally {
      setEnrollingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-full" />)}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Eventos</h1>
        <p className="mt-1 text-muted-foreground">
          Participa en jornadas de limpieza y acción ambiental. Cada evento suma puntos a tu racha.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((e) => {
          const locked = profile ? roleRank[profile.role] < roleRank[e.minRole] : false
          const isEnrolled = enrolledIds.has(e.id)
          const isFull = e.status === "lleno"
          const isUpcoming = e.status === "proximamente"
          const isBusy = enrollingId === e.id

          return (
            <Card key={e.id} className="flex flex-col overflow-hidden p-0">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.image || "/placeholder.svg"} alt={e.title} className="size-full object-cover" />
                <Badge className={`absolute left-3 top-3 border-0 ${statusStyles[e.status]}`}>
                  {statusLabels[e.status]}
                </Badge>
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/55 text-background backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <Lock className="size-6" />
                      <span className="text-xs font-medium">Solo líderes ambientales</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{categoryLabels[e.category]}</Badge>
                  <span className="flex items-center gap-1 text-xs font-medium text-accent-foreground">
                    <Star className="size-3.5 fill-current" /> {e.points} pts
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold leading-snug">{e.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                </div>

                <div className="mt-auto space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4" /> {e.date} · {e.time}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4" /> {e.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="size-4" /> {e.enrolled}/{e.capacity} inscritos
                  </p>
                </div>

                <Button
                  className="w-full"
                  variant={isEnrolled ? "outline" : "default"}
                  disabled={locked || (isFull && !isEnrolled) || isUpcoming || isBusy}
                  onClick={() => toggleEnroll(e.id, e.title)}
                >
                  {isBusy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : locked ? (
                    <><Lock className="size-4" /> Bloqueado</>
                  ) : isEnrolled ? (
                    <><Check className="size-4" /> Inscrito — Cancelar</>
                  ) : isFull ? (
                    "Cupo lleno"
                  ) : isUpcoming ? (
                    "Próximamente"
                  ) : (
                    "Inscribirme"
                  )}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
