"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface CafeteriaItem {
  id: string
  name: string
  description: string
  cost: number
  category: "bebida" | "desayuno" | "snack" | "almuerzo"
  image_url: string
  available: boolean
  sustainable: boolean
}

export function useCafeteria() {
  const [menu, setMenu] = useState<CafeteriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchMenu() {
    setLoading(true)
    const { data, error } = await supabase
      .from("cafeteria_menu")
      .select("*")
      .eq("available", true)
      .order("category", { ascending: true })

    if (error) setError(error.message)
    else setMenu((data ?? []) as CafeteriaItem[])
    setLoading(false)
  }

  useEffect(() => {
    fetchMenu()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function order(itemId: string) {
    const res = await fetch("/api/cafeteria/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    })
    return res
  }

  return { menu, loading, error, refetch: fetchMenu, order }
}
