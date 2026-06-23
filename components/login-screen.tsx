"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Leaf, Sprout, ShieldCheck, ArrowRight, Recycle, TreePine, Loader2, UserPlus, LogIn } from "lucide-react"

type AuthMode = "login" | "register"
type SocialProvider = "google" | "github" | "facebook"

/* ── Iconos SVG inline para los proveedores ── */
function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null)
  const supabase = createClient()

  /* ── Login / Registro con email ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          toast.error("Error al iniciar sesión", { description: error.message })
        } else {
          toast.success("¡Bienvenido de vuelta!")
          onLogin()
        }
      } else {
        if (!name.trim()) {
          toast.error("Ingresa tu nombre completo")
          setLoading(false)
          return
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (error) {
          toast.error("Error al registrarse", { description: error.message })
        } else {
          toast.success("¡Cuenta creada!", {
            description: "Verifica tu correo para activar tu cuenta.",
          })
          setMode("login")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  /* ── OAuth social ── */
  async function handleSocialLogin(provider: SocialProvider) {
    setSocialLoading(provider)
    const redirectTo = `${window.location.origin}/api/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })

    if (error) {
      toast.error(`Error al conectar con ${providerLabel(provider)}`, {
        description: error.message,
      })
      setSocialLoading(null)
    }
    // Si no hay error, Supabase redirige al proveedor → no hace falta limpiar el estado
  }

  function providerLabel(p: SocialProvider) {
    return { google: "Google", github: "GitHub", facebook: "Facebook" }[p]
  }

  return (
    <main className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* ── Brand / hero side ── */}
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

      {/* ── Form side ── */}
      <section className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile */}
          <div className="space-y-2 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Leaf className="size-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Raíz Verde</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {mode === "login" ? "Inicia sesión" : "Únete al colectivo"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Bienvenido de vuelta al colectivo Raíz Verde."
                : "Crea tu cuenta y empieza a generar impacto ambiental."}
            </p>
          </div>

          {/* ── Botones de redes sociales ── */}
          <div className="space-y-3">
            <SocialButton
              id="btn-google"
              icon={<GoogleIcon />}
              label="Continuar con Google"
              loading={socialLoading === "google"}
              disabled={!!socialLoading || loading}
              onClick={() => handleSocialLogin("google")}
            />
            <SocialButton
              id="btn-github"
              icon={<GitHubIcon />}
              label="Continuar con GitHub"
              loading={socialLoading === "github"}
              disabled={!!socialLoading || loading}
              onClick={() => handleSocialLogin("github")}
            />
            <SocialButton
              id="btn-facebook"
              icon={<FacebookIcon />}
              label="Continuar con Facebook"
              loading={socialLoading === "facebook"}
              disabled={!!socialLoading || loading}
              onClick={() => handleSocialLogin("facebook")}
            />
          </div>

          {/* ── Separador ── */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">o con correo</span>
            </div>
          </div>

          {/* ── Formulario email / contraseña ── */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@raizverde.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading || !!socialLoading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : mode === "login" ? (
                <>
                  <LogIn className="size-4" /> Entrar
                </>
              ) : (
                <>
                  <UserPlus className="size-4" /> Crear cuenta
                </>
              )}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          {/* Demo credentials hint */}
          {mode === "login" && (
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Cuentas de demostración:</p>
              <p>👤 lucia@raizverde.org — Miembro</p>
              <p>🌿 mateo@raizverde.org — Líder</p>
              <p>🛡 admin@raizverde.org — Administrador</p>
              <p className="mt-1 opacity-70">Contraseña: demo1234</p>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                ¿Aún no eres miembro?{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => setMode("register")}
                >
                  Únete al colectivo
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => setMode("login")}
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </div>
      </section>
    </main>
  )
}

/* ── Botón social reutilizable ── */
function SocialButton({
  id,
  icon,
  label,
  loading,
  disabled,
  onClick,
}: {
  id: string
  icon: React.ReactNode
  label: string
  loading: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {label}
    </button>
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
