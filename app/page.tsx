"use client"

import { useState } from "react"
import type { Role } from "@/lib/types"
import { LoginScreen } from "@/components/login-screen"
import { Dashboard } from "@/components/dashboard/dashboard"
import { Toaster } from "@/components/ui/sonner"

export default function Page() {
  const [role, setRole] = useState<Role | null>(null)

  return (
    <>
      {role === null ? (
        <LoginScreen onLogin={setRole} />
      ) : (
        <Dashboard role={role} onRoleChange={setRole} onLogout={() => setRole(null)} />
      )}
      <Toaster position="top-right" />
    </>
  )
}
