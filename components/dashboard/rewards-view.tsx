"use client"

import { useProfile } from "@/hooks/use-profile"
import { useRewards } from "@/hooks/use-rewards"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Gift, Coffee, ShoppingBag, Sparkles, Lock, Check, Star, Loader2 } from "lucide-react"
import { useState } from "react"
import type { Role } from "@/lib/types"

const roleRank: Record<Role, number> = { usuario: 0, lider: 1, admin: 2 }
const catIcon = { cafeteria: Coffee, merch: ShoppingBag, experiencia: Sparkles }
const catLabel = { cafeteria: "Cafetería", merch: "Merch", experiencia: "Experiencia" }

export function RewardsView() {
  const { profile } = useProfile()
  const { rewards, redeemedIds, loading, redeem } = useRewards()
  const [redeemingId, setRedeemingId] = useState<string | null>(null)

  async function handleRedeem(id: string, title: string, cost: number) {
    setRedeemingId(id)
    try {
      const res = await redeem(id)
      if (res.ok) {
        toast.success("¡Recompensa canjeada!", { description: `${title} · -${cost} pts` })
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error("No se pudo canjear", { description: data.error ?? "Intenta de nuevo" })
      }
    } finally {
      setRedeemingId(null)
    }
  }

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Recompensas</h1>
          <p className="mt-1 text-muted-foreground">Canjea tus puntos por beneficios sostenibles.</p>
        </div>
        <Card className="flex items-center gap-3 bg-accent/15 px-5 py-3">
          <Star className="size-5 fill-accent-foreground text-accent-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Tus puntos</p>
            <p className="text-xl font-semibold leading-none">{profile.points.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((r) => {
          const Icon = catIcon[r.category]
          const locked = roleRank[profile.role] < roleRank[r.minRole]
          const isRedeemed = redeemedIds.has(r.id)
          const tooExpensive = profile.points < r.cost
          const disabled = locked || !r.available || isRedeemed || tooExpensive
          const isBusy = redeemingId === r.id

          return (
            <Card key={r.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <Badge variant="secondary">{catLabel[r.category]}</Badge>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold leading-snug">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              </div>

              {locked && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Lock className="size-3.5" /> Exclusivo para líderes ambientales
                </p>
              )}
              {!r.available && !locked && (
                <p className="text-xs font-medium text-muted-foreground">Agotado temporalmente</p>
              )}

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold text-accent-foreground">
                  <Gift className="size-4" /> {r.cost} pts
                </span>
                <Button
                  size="sm"
                  disabled={disabled || isBusy}
                  onClick={() => handleRedeem(r.id, r.title, r.cost)}
                >
                  {isBusy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isRedeemed ? (
                    <><Check className="size-4" /> Canjeado</>
                  ) : locked ? (
                    "Bloqueado"
                  ) : tooExpensive ? (
                    "Faltan puntos"
                  ) : (
                    "Canjear"
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
