"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LoginScreen } from "@/components/login-screen"
import { Dashboard } from "@/components/dashboard/dashboard"
import { Toaster } from "@/components/ui/sonner"
import type { User } from "@supabase/supabase-js"

export default function Page() {
  const [user, setUser] = useState<User | null | undefined>(undefined) // undefined = cargando
  const supabase = createClient()

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (user === undefined) {
    // Cargando sesión inicial
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {user === null ? (
        <LoginScreen onLogin={() => {}} />
      ) : (
        <Dashboard onLogout={async () => {
          await supabase.auth.signOut()
        }} />
      )}
      <Toaster position="top-right" />
    </>
  )
}
