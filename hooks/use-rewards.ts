"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Reward } from "@/lib/types"

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redeemedIds, setRedeemedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchRewards() {
    setLoading(true)
    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .order("cost", { ascending: true })

    if (error) setError(error.message)
    else setRewards((data ?? []).map(dbToReward))

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: redemptions } = await supabase
        .from("redemptions")
        .select("reward_id")
        .eq("user_id", user.id)
        .eq("status", "pendiente")
      setRedeemedIds(new Set((redemptions ?? []).map((r: { reward_id: string }) => r.reward_id)))
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchRewards()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function redeem(rewardId: string) {
    const res = await fetch(`/api/rewards/${rewardId}/redeem`, { method: "POST" })
    if (res.ok) {
      setRedeemedIds(prev => new Set(prev).add(rewardId))
      await fetchRewards()
    }
    return res
  }

  return { rewards, redeemedIds, loading, error, refetch: fetchRewards, redeem }
}

function dbToReward(row: Record<string, unknown>): Reward {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    cost: row.cost as number,
    category: row.category as Reward["category"],
    minRole: row.min_role as Reward["minRole"],
    available: row.available as boolean,
  }
}
