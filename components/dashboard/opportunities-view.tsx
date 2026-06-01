"use client"

import { opportunities } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Briefcase, GraduationCap, HeartHandshake, Building2, MapPin, ArrowUpRight } from "lucide-react"

const typeMeta = {
  empleo: { label: "Empleo", icon: Briefcase, tone: "bg-primary/10 text-primary" },
  beca: { label: "Beca", icon: GraduationCap, tone: "bg-accent/20 text-accent-foreground" },
  voluntariado: { label: "Voluntariado", icon: HeartHandshake, tone: "bg-chart-2/20 text-foreground" },
  convenio: { label: "Convenio", icon: Building2, tone: "bg-secondary text-secondary-foreground" },
} as const

export function OpportunitiesView() {
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
            Tu compromiso constante te da acceso a esta bolsa de oportunidades.
          </p>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {opportunities.map((o) => {
          const meta = typeMeta[o.type]
          const Icon = meta.icon
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
                <Button size="sm" onClick={() => toast.success("¡Postulación enviada!", { description: o.title })}>
                  Postular <ArrowUpRight className="size-4" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
