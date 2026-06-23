"use client"

import { useState } from "react"
import { useOpportunities } from "@/hooks/use-opportunities"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Briefcase, GraduationCap, HeartHandshake, Building2, MapPin, ArrowUpRight, Loader2, Check } from "lucide-react"

const typeMeta = {
  empleo:      { label: "Empleo",      icon: Briefcase,       tone: "bg-primary/10 text-primary" },
  beca:        { label: "Beca",        icon: GraduationCap,   tone: "bg-accent/20 text-accent-foreground" },
  voluntariado:{ label: "Voluntariado",icon: HeartHandshake,  tone: "bg-chart-2/20 text-foreground" },
  convenio:    { label: "Convenio",    icon: Building2,       tone: "bg-secondary text-secondary-foreground" },
} as const

export function OpportunitiesView() {
  const { opportunities, appliedIds, loading, apply } = useOpportunities()
  const [applyingId, setApplyingId] = useState<string | null>(null)

  async function handleApply(id: string, title: string) {
    setApplyingId(id)
    try {
      const res = await apply(id)
      if (res.ok) {
        toast.success("¡Postulación enviada!", { description: title })
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error("No se pudo postular", { description: data.error ?? "Intenta de nuevo" })
      }
    } finally {
      setApplyingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24" />
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Oportunidades</h1>
        <p className="mt-1 text-muted-foreground">
          Beneficio exclusivo para líderes ambientales: empleos, becas y convenios con el estado y organizaciones aliadas.
        </p>
      </div>

      <Card className="flex items-center gap-4 bg-primary p-6 text-primary-foreground">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary-foreground/15">
          <Briefcase className="size-6" />
        </div>
        <div>
          <p className="font-semibold">Acceso de Líder Ambiental desbloqueado</p>
          <p className="text-sm text-primary-foreground/80">
            Tu compromiso constante te da acceso a esta bolsa de oportunidades ({opportunities.length} disponibles).
          </p>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {opportunities.map((o) => {
          const meta = typeMeta[o.type]
          const Icon = meta.icon
          const isApplied = appliedIds.has(o.id)
          const isBusy = applyingId === o.id

          return (
            <Card key={o.id} className="flex flex-col gap-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex size-11 items-center justify-center rounded-lg ${meta.tone}`}>
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold leading-snug">{o.title}</h3>
                    <p className="text-sm text-muted-foreground">{o.org}</p>
                  </div>
                </div>
                <Badge variant="secondary">{meta.label}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">{o.description}</p>

              <div className="mt-auto flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4" /> {o.location}
                </span>
                <Button
                  size="sm"
                  variant={isApplied ? "outline" : "default"}
                  disabled={isApplied || isBusy}
                  onClick={() => handleApply(o.id, o.title)}
                >
                  {isBusy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isApplied ? (
                    <><Check className="size-4" /> Postulado</>
                  ) : (
                    <>Postular <ArrowUpRight className="size-4" /></>
                  )}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {opportunities.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <Briefcase className="mx-auto mb-3 size-10 opacity-30" />
          <p>No hay oportunidades disponibles actualmente.</p>
        </div>
      )}
    </div>
  )
}
