import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/events/[id]/enroll — inscribirse
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: eventId } = await params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  // Verificar que el evento no esté lleno
  const { data: event } = await supabase
    .from("events").select("status, enrolled, capacity, min_role").eq("id", eventId).single()

  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
  if (event.status === "lleno") return NextResponse.json({ error: "Cupo lleno" }, { status: 400 })
  if (event.status === "finalizado") return NextResponse.json({ error: "Evento finalizado" }, { status: 400 })

  // Verificar rol mínimo
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  const roleRank: Record<string, number> = { usuario: 0, lider: 1, admin: 2 }
  if (roleRank[profile?.role ?? "usuario"] < roleRank[event.min_role]) {
    return NextResponse.json({ error: "Rol insuficiente" }, { status: 403 })
  }

  const { error } = await supabase
    .from("event_enrollments").insert({ event_id: eventId, user_id: user.id })

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Ya inscrito" }, { status: 400 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/events/[id]/enroll — cancelar inscripción
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: eventId } = await params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { error } = await supabase
    .from("event_enrollments")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
