"use client"

import type React from "react"
import type { CurrentUser } from "@/lib/types"
import type { ViewId } from "./sidebar"
import { events, rewards } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Flame, TreePine, Recycle, CalendarCheck, ArrowRight, Coffee, Gift } from "lucide-react"

const STREAK_GOAL = 4 // semanas para próximo nivel

export function OverviewView({ user, onNavigate }: { user: CurrentUser; onNavigate: (v: ViewId) => void }) {
  const nextEvents = events.filter((e) => e.status !== "finalizado").slice(0, 3)
  const pct = Math.min(100, (user.streak / STREAK_GOAL) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Hola, {user.name.split(" ")[0]} 🌱</h1>
        <p className="mt-1 text-muted-foreground">Este es el impacto que estás generando con el colectivo.</p>
      </div>

      {/* Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Flame} label="Racha semanal" value={`${user.streak} sem`} tone="accent" />
        <StatCard icon={CalendarCheck} label="Eventos asistidos" value={user.eventsAttended} />
        <StatCard icon={TreePine} label="Árboles plantados" value={user.treesPlanted} />
        <StatCard icon={Recycle} label="Kg reciclados" value={user.kgRecycled} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Streak progress */}
        <Card className="space-y-4 p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Tu progreso</h2>
              <p className="text-sm text-muted-foreground">
                Mantén tu racha para subir de nivel y desbloquear más beneficios.
              </p>
            </div>
            <Badge className="gap-1 bg-accent text-accent-foreground hover:bg-accent">
              <Flame className="size-3.5" /> {user.streak} semanas
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hacia el siguiente nivel</span>
              <span className="font-medium">
                {user.streak}/{STREAK_GOAL} semanas
              </span>
            </div>
            <Progress value={pct} className="h-2.5" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <LevelPill label="Beneficios cafetería" unlocked={user.streak >= 1} note="Racha ≥ 1 sem" />
            <LevelPill label="Descuentos premium" unlocked={user.streak >= 4} note="Racha ≥ 4 sem" />
            <LevelPill label="Líder ambiental" unlocked={user.role !== "usuario"} note="Racha ≥ 10 sem" />
          </div>

          <Button variant="outline" className="w-fit bg-transparent" onClick={() => onNavigate("streak")}>
            Ver mi racha en detalle <ArrowRight className="size-4" />
          </Button>
        </Card>

        {/* Quick actions */}
        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">Accesos rápidos</h2>
          <QuickAction icon={CalendarCheck} label="Inscribirme a un evento" onClick={() => onNavigate("events")} />
          <QuickAction icon={Coffee} label="Canjear en cafetería" onClick={() => onNavigate("cafeteria")} />
          <QuickAction icon={Gift} label="Ver recompensas" onClick={() => onNavigate("rewards")} />
        </Card>
      </div>

      {/* Upcoming events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Próximos eventos</h2>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("events")}>
            Ver todos <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {nextEvents.map((e) => (
            <Card key={e.id} className="overflow-hidden p-0">
              <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.image || "/placeholder.svg"} alt={e.title} className="size-full object-cover" />
              </div>
              <div className="space-y-1 p-4">
                <p className="text-xs font-medium text-primary">{e.date} · {e.time}</p>
                <p className="font-medium leading-snug">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.location}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured rewards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recompensas destacadas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.filter((r) => r.available).slice(0, 3).map((r) => (
            <Card key={r.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
              <Badge variant="secondary" className="shrink-0">{r.cost} pts</Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  tone?: "accent"
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-lg ${
            tone === "accent" ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function LevelPill({ label, unlocked, note }: { label: string; unlocked: boolean; note: string }) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        unlocked ? "border-primary/30 bg-primary/5" : "border-border bg-muted/40"
      }`}
    >
      <p className={`text-sm font-medium ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{unlocked ? "Desbloqueado" : note}</p>
    </div>
  )
}

function QuickAction({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left text-sm font-medium transition-colors hover:border-primary/40 hover:bg-secondary"
    >
      <Icon className="size-[18px] text-primary" />
      <span className="flex-1">{label}</span>
      <ArrowRight className="size-4 text-muted-foreground" />
    </button>
  )
}
