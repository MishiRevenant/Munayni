"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { CollectiveEvent, EventCategory } from "@/lib/types"

export function useEvents(filter?: EventCategory | "todos") {
  const [events, setEvents] = useState<CollectiveEvent[]>([])
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    let query = supabase.from("events").select("*").order("date", { ascending: true })

    if (filter && filter !== "todos") {
      query = query.eq("category", filter)
    }

    const { data, error } = await query
    if (error) { setError(error.message) }
    else {
      setEvents((data ?? []).map(dbToEvent))
    }

    // Obtener inscripciones del usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: enrollments } = await supabase
        .from("event_enrollments")
        .select("event_id")
        .eq("user_id", user.id)
      setEnrolledIds(new Set((enrollments ?? []).map((e: { event_id: string }) => e.event_id)))
    }

    setLoading(false)
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  async function enroll(eventId: string) {
    const res = await fetch(`/api/events/${eventId}/enroll`, { method: "POST" })
    if (res.ok) {
      setEnrolledIds(prev => new Set(prev).add(eventId))
      await fetchEvents()
    }
    return res
  }

  async function unenroll(eventId: string) {
    const res = await fetch(`/api/events/${eventId}/enroll`, { method: "DELETE" })
    if (res.ok) {
      setEnrolledIds(prev => { const s = new Set(prev); s.delete(eventId); return s })
      await fetchEvents()
    }
    return res
  }

  return { events, enrolledIds, loading, error, refetch: fetchEvents, enroll, unenroll }
}

function dbToEvent(row: Record<string, unknown>): CollectiveEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as CollectiveEvent["category"],
    date: new Date(row.date as string).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" }),
    time: (row.time as string).slice(0, 5),
    location: row.location as string,
    description: row.description as string,
    capacity: row.capacity as number,
    enrolled: row.enrolled as number,
    points: row.points as number,
    status: row.status as CollectiveEvent["status"],
    minRole: row.min_role as CollectiveEvent["minRole"],
    image: (row.image_url as string) || "/placeholder.svg",
  }
}
