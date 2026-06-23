"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface WeeklyActivity {
  week: string
  puntos: number
}

export function useActivity() {
  const [weeklyData, setWeeklyData] = useState<WeeklyActivity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchActivity() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const eightWeeksAgo = new Date()
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

      const { data } = await supabase
        .from("weekly_activity")
        .select("week_start, points")
        .eq("user_id", user.id)
        .gte("week_start", eightWeeksAgo.toISOString().split("T")[0])
        .order("week_start", { ascending: true })

      if (data && data.length > 0) {
        setWeeklyData(data.map((row: { week_start: string; points: number }, i: number) => ({
          week: `S${i + 1}`,
          puntos: row.points,
        })))
      } else {
        // Datos de demostración si no hay historial
        setWeeklyData([
          { week: "S1", puntos: 60 },
          { week: "S2", puntos: 80 },
          { week: "S3", puntos: 50 },
          { week: "S4", puntos: 120 },
          { week: "S5", puntos: 90 },
          { week: "S6", puntos: 140 },
          { week: "S7", puntos: 110 },
          { week: "S8", puntos: 160 },
        ])
      }
      setLoading(false)
    }
    fetchActivity()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { weeklyData, loading }
}
