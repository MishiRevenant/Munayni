"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Opportunity } from "@/lib/types"

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchOpportunities() {
    setLoading(true)
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })

    if (error) setError(error.message)
    else setOpportunities((data ?? []).map(dbToOpportunity))

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: apps } = await supabase
        .from("applications")
        .select("opportunity_id")
        .eq("user_id", user.id)
      setAppliedIds(new Set((apps ?? []).map((a: { opportunity_id: string }) => a.opportunity_id)))
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchOpportunities()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function apply(opportunityId: string, message?: string) {
    const res = await fetch(`/api/opportunities/${opportunityId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
    if (res.ok) {
      setAppliedIds(prev => new Set(prev).add(opportunityId))
    }
    return res
  }

  return { opportunities, appliedIds, loading, error, refetch: fetchOpportunities, apply }
}

function dbToOpportunity(row: Record<string, unknown>): Opportunity {
  return {
    id: row.id as string,
    title: row.title as string,
    org: row.org as string,
    type: row.type as Opportunity["type"],
    location: row.location as string,
    description: row.description as string,
  }
}
