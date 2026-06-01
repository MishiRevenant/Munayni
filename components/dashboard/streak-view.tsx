"use client"

import type { CurrentUser } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Flame, Check, Lock, Coffee, BadgePercent, Crown, Briefcase } from "lucide-react"

const weekData = [
  { week: "S1", puntos: 60 },
  { week: "S2", puntos: 80 },
  { week: "S3", puntos: 50 },
  { week: "S4", puntos: 120 },
  { week: "S5", puntos: 90 },
  { week: "S6", puntos: 140 },
  { week: "S7", puntos: 110 },
  { week: "S8", puntos: 160 },
]

const days = ["L", "M", "M", "J", "V", "S", "D"]

const milestones = [
  { weeks: 1, icon: Coffee, title: "Beneficios en cafetería", desc: "Café y desayunos sostenibles canjeables." },
  { weeks: 4, icon: BadgePercent, title: "Descuentos premium", desc: "Hasta 30% en la cafetería sostenible." },
  { weeks: 10, icon: Crown, title: "Líder Ambiental", desc: "Gestiona eventos junto a la administración." },
  { weeks: 16, icon: Briefcase, title: "Oportunidades laborales", desc: "Acceso a convenios con el estado y aliados." },
]

export function StreakView({ user }: { user: CurrentUser }) {
  const goal = milestones.find((m) => m.weeks > user.streak)?.weeks ?? 20
  const prevGoal = [...milestones].reverse().find((m) => m.weeks <= user.streak)?.weeks ?? 0
  const pct = Math.min(100, ((user.streak - prevGoal) / (goal - prevGoal)) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Mi Racha</h1>
        <p className="mt-1 text-muted-foreground">
          Participa cada semana para mantener tu racha activa y desbloquear beneficios.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Streak hero */}
        <Card className="flex flex-col items-center justify-center gap-3 bg-primary p-8 text-center text-primary-foreground">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary-foreground/15">
            <Flame className="size-8" />
          </div>
          <p className="text-5xl font-semibold">{user.streak}</p>
          <p className="text-primary-foreground/80">semanas consecutivas</p>
          <Badge className="border-0 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/15">
            ¡Sigue así! Próximo nivel en {goal - user.streak} sem
          </Badge>
        </Card>

        {/* This week */}
        <Card className="space-y-4 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Esta semana</h2>
            <span className="text-sm text-muted-foreground">5 de 7 días activos</span>
          </div>
          <div className="flex justify-between gap-2">
            {days.map((d, i) => {
              const active = i < 5
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`flex aspect-square w-full max-w-12 items-center justify-center rounded-lg ${
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {active ? <Check className="size-5" /> : <span className="text-sm">{d}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{d}</span>
                </div>
              )
            })}
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso al siguiente nivel</span>
              <span className="font-medium">{user.streak}/{goal} sem</span>
            </div>
            <Progress value={pct} className="h-2.5" />
          </div>
        </Card>
      </div>

      {/* Points chart */}
      <Card className="space-y-4 p-6">
        <div>
          <h2 className="text-lg font-semibold">Puntos por semana</h2>
          <p className="text-sm text-muted-foreground">Tu actividad en las últimas 8 semanas.</p>
        </div>
        <ChartContainer
          config={{ puntos: { label: "Puntos", color: "var(--chart-1)" } }}
          className="aspect-[3/1] w-full"
        >
          <BarChart data={weekData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="puntos" fill="var(--color-puntos)" radius={6} />
          </BarChart>
        </ChartContainer>
      </Card>

      {/* Milestones */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Niveles y recompensas por racha</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {milestones.map(({ weeks, icon: Icon, title, desc }) => {
            const unlocked = user.streak >= weeks
            return (
              <Card key={weeks} className={`flex gap-4 p-5 ${unlocked ? "border-primary/30 bg-primary/5" : ""}`}>
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${
                    unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {unlocked ? <Icon className="size-5" /> : <Lock className="size-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{title}</p>
                    <Badge variant={unlocked ? "default" : "secondary"}>{weeks} sem</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
