"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { CurrentUser } from "@/lib/types"

export interface Profile extends CurrentUser {
  id: string
  joined: string
  avatar_url?: string
  bio?: string
  last_active?: string
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchProfile() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      setError(error.message)
    } else if (data) {
      setProfile({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        streak: data.streak,
        points: data.points,
        eventsAttended: data.events_attended,
        treesPlanted: data.trees_planted,
        kgRecycled: data.kg_recycled,
        joined: data.joined,
        avatar_url: data.avatar_url,
        bio: data.bio,
        last_active: data.last_active,
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function updateProfile(updates: Partial<{ name: string; bio: string; avatar_url: string }>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)

    if (!error) await fetchProfile()
    return { error: error?.message }
  }

  return { profile, loading, error, refetch: fetchProfile, updateProfile }
}
