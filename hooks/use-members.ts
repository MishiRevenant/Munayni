"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Member, Role } from "@/lib/types"

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchMembers() {
    setLoading(true)
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("joined", { ascending: true })

    if (error) setError(error.message)
    else setMembers((data ?? []).map(dbToMember))

    setLoading(false)
  }

  useEffect(() => {
    fetchMembers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function changeRole(userId: string, role: Role) {
    const res = await fetch("/api/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    })
    if (res.ok) {
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, role } : m))
    }
    return res
  }

  async function remove(userId: string) {
    const res = await fetch(`/api/members?userId=${userId}`, { method: "DELETE" })
    if (res.ok) {
      setMembers(prev => prev.filter(m => m.id !== userId))
    }
    return res
  }

  return { members, loading, error, refetch: fetchMembers, changeRole, remove }
}

function dbToMember(row: Record<string, unknown>): Member {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as Role,
    streak: row.streak as number,
    points: row.points as number,
    eventsAttended: row.events_attended as number,
    joined: new Date(row.joined as string).toLocaleDateString("es-MX", { month: "short", year: "numeric" }),
  }
}
