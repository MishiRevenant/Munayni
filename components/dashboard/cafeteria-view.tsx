"use client"

import type { CurrentUser } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Coffee, Leaf, Lock, CheckCircle2, Percent } from "lucide-react"

const menu = [
  { name: "Café de especialidad", desc: "Origen orgánico, comercio justo", price: "80 pts", img: "/specialty-coffee-cup.png" },
  { name: "Bowl de avena verde", desc: "Avena, fruta de temporada y semillas", price: "150 pts", img: "/green-oatmeal-bowl.png" },
  { name: "Sándwich vegano", desc: "Pan integral de masa madre", price: "200 pts", img: "/vegan-sandwich.png" },
  { name: "Smoothie de temporada", desc: "Fruta local sin azúcar añadida", price: "120 pts", img: "/colorful-fruit-smoothie.png" },
]

export function CafeteriaView({ user }: { user: CurrentUser }) {
  const hasBenefits = user.streak >= 1
  const hasPremium = user.streak >= 4 || user.role !== "usuario"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Cafetería Sostenible</h1>
        <p className="mt-1 text-muted-foreground">
          Tu espacio para recargar energía con productos locales y de bajo impacto.
        </p>
      </div>

      {/* Access banner */}
      <Card
        className={`flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between ${
          hasBenefits ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex size-12 items-center justify-center rounded-xl ${
              hasBenefits ? "bg-primary-foreground/15" : "bg-background text-muted-foreground"
            }`}
          >
            {hasBenefits ? <CheckCircle2 className="size-6" /> : <Lock className="size-6" />}
          </div>
          <div>
            <p className="font-semibold">
              {hasBenefits ? "Beneficios activos" : "Mantén una racha semanal para acceder"}
            </p>
            <p className={`text-sm ${hasBenefits ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {hasBenefits
                ? "Puedes canjear tus puntos por productos de la cafetería."
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {menu.map((item) => (
            <Card key={item.name} className="flex flex-col overflow-hidden p-0">
              <div className="aspect-square w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img || "/placeholder.svg"} alt={item.name} className="size-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Leaf className="size-3.5" /> Sostenible
                </div>
                <div className="flex-1">
                  <p className="font-medium leading-snug">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-accent-foreground">{item.price}</span>
                  <Button
                    size="sm"
                    variant={hasBenefits ? "default" : "outline"}
                    disabled={!hasBenefits}
                    onClick={() => toast.success("Pedido enviado", { description: item.name })}
                  >
                    {hasBenefits ? (
                      <>
                        <Coffee className="size-4" /> Pedir
                      </>
                    ) : (
                      <>
                        <Lock className="size-4" /> Bloqueado
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
