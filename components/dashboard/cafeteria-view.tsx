"use client"

import { useState } from "react"
import { useProfile } from "@/hooks/use-profile"
import { useCafeteria } from "@/hooks/use-cafeteria"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Coffee, Leaf, Lock, CheckCircle2, Percent, Loader2 } from "lucide-react"

const categoryLabel: Record<string, string> = {
  bebida: "Bebida", desayuno: "Desayuno", snack: "Snack", almuerzo: "Almuerzo"
}

export function CafeteriaView() {
  const { profile } = useProfile()
  const { menu, loading, order } = useCafeteria()
  const [orderingId, setOrderingId] = useState<string | null>(null)

  const hasBenefits = (profile?.streak ?? 0) >= 1
  const hasPremium = (profile?.streak ?? 0) >= 4 || (profile?.role !== "usuario")

  async function handleOrder(itemId: string, name: string) {
    setOrderingId(itemId)
    try {
      const res = await order(itemId)
      if (res.ok) {
        toast.success("¡Pedido enviado!", { description: name })
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error("No se pudo realizar el pedido", { description: data.error ?? "Intenta de nuevo" })
      }
    } finally {
      setOrderingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Cafetería Sostenible</h1>
        <p className="mt-1 text-muted-foreground">
          Tu espacio para recargar energía con productos locales y de bajo impacto.
        </p>
      </div>

      {/* Access banner */}
      <Card className={`flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between ${
        hasBenefits ? "bg-primary text-primary-foreground" : "bg-muted"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`flex size-12 items-center justify-center rounded-xl ${
            hasBenefits ? "bg-primary-foreground/15" : "bg-background text-muted-foreground"
          }`}>
            {hasBenefits ? <CheckCircle2 className="size-6" /> : <Lock className="size-6" />}
          </div>
          <div>
            <p className="font-semibold">
              {hasBenefits ? "Beneficios activos" : "Mantén una racha semanal para acceder"}
            </p>
            <p className={`text-sm ${hasBenefits ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {hasBenefits
                ? `Tienes ${profile?.points.toLocaleString() ?? 0} pts disponibles para canjear.`
                : "Asiste a un evento cada semana para desbloquear los beneficios."}
            </p>
          </div>
        </div>
        {hasPremium && (
          <Badge className="border-0 bg-accent text-accent-foreground hover:bg-accent">
            <Percent className="size-3.5" /> 30% de descuento premium
          </Badge>
        )}
      </Card>

      {/* Menu */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Menú</h2>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : (
          <>
            {/* Agrupar por categoría */}
            {(["bebida", "desayuno", "almuerzo", "snack"] as const).map((cat) => {
              const items = menu.filter((item) => item.category === cat)
              if (items.length === 0) return null
              return (
                <div key={cat} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {categoryLabel[cat]}
                  </h3>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item) => {
                      const isBusy = orderingId === item.id
                      const effectiveCost = hasPremium ? Math.round(item.cost * 0.7) : item.cost
                      return (
                        <Card key={item.id} className="flex flex-col overflow-hidden p-0">
                          <div className="aspect-square w-full overflow-hidden bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image_url || "/placeholder.svg"}
                              alt={item.name}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-2 p-4">
                            {item.sustainable && (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                                <Leaf className="size-3.5" /> Sostenible
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium leading-snug">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-semibold text-accent-foreground">
                                  {effectiveCost} pts
                                </span>
                                {hasPremium && (
                                  <span className="ml-1.5 text-xs line-through text-muted-foreground">
                                    {item.cost}
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant={hasBenefits ? "default" : "outline"}
                                disabled={!hasBenefits || isBusy}
                                onClick={() => handleOrder(item.id, item.name)}
                              >
                                {isBusy ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : hasBenefits ? (
                                  <><Coffee className="size-4" /> Pedir</>
                                ) : (
                                  <><Lock className="size-4" /> Bloqueado</>
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
