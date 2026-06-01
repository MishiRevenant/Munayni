"use client"

import type React from "react"
import { useState } from "react"
import type { Role } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, Sprout, ShieldCheck, ArrowRight, Recycle, TreePine } from "lucide-react"

const demoRoles: { role: Role; label: string; desc: string; icon: React.ElementType }[] = [
  { role: "usuario", label: "Miembro", desc: "Lucía · racha de 3 semanas", icon: Sprout },
  { role: "lider", label: "Líder Ambiental", desc: "Mateo · racha de 11 semanas", icon: Leaf },
  { role: "admin", label: "Administrador", desc: "Control total del colectivo", icon: ShieldCheck },
]

export function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [selected, setSelected] = useState<Role>("usuario")

  return (
    <main className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Brand / hero side */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Leaf className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Raíz Verde</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-balance font-serif text-4xl font-semibold leading-tight">
            Pequeñas acciones, raíces que transforman el planeta.
          </h1>
          <p className="max-w-md text-pretty leading-relaxed text-primary-foreground/80">
            Únete a las jornadas de limpieza, mantén tu racha semanal y desbloquea beneficios en
            nuestra cafetería sostenible. Crece hasta convertirte en líder ambiental.
          </p>
          <div className="flex flex-wrap gap-6 pt-2">
            <Stat icon={TreePine} value="12.4k" label="Árboles plantados" />
            <Stat icon={Recycle} value="38 t" label="Residuos reciclados" />
            <Stat icon={Sprout} value="2.1k" label="Miembros activos" />
          </div>
        </div>

        <p className="text-sm text-primary-foreground/60">Colectivo ambiental sin fines de lucro · Est. 2021</p>
      </section>

      {/* Form side */}
      <section className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Leaf className="size-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Raíz Verde</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Inicia sesión</h2>
            <p className="text-sm text-muted-foreground">
              Bienvenido de nuevo al colectivo. Elige un perfil de demostración para explorar.
            </p>
          </div>

          {/* Role picker (demo) */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Perfil de demostración</Label>
            <div className="grid gap-3">
              {demoRoles.map(({ role, label, desc, icon: Icon }) => {
                const active = selected === role
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelected(role)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      active
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                        active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="truncate text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              onLogin(selected)
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" placeholder="tu@raizverde.org" defaultValue="lucia@raizverde.org" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••••" defaultValue="demo1234" />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Entrar como {demoRoles.find((r) => r.role === selected)?.label}
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿Aún no eres miembro?{" "}
            <button className="font-medium text-primary underline-offset-4 hover:underline">Únete al colectivo</button>
          </p>
        </div>
      </section>
    </main>
  )
}

function Stat({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-5 text-primary-foreground/70" />
      <div className="leading-tight">
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-xs text-primary-foreground/70">{label}</p>
      </div>
    </div>
  )
}
