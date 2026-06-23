import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PATCH /api/events/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["lider", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 })
  }

  const body = await request.json()
  const updates: Record<string, unknown> = {}
  if (body.title) updates.title = body.title
  if (body.category) updates.category = body.category
  if (body.date) updates.date = body.date
  if (body.time) updates.time = body.time
  if (body.location) updates.location = body.location
  if (body.description !== undefined) updates.description = body.description
  if (body.capacity) updates.capacity = body.capacity
  if (body.points) updates.points = body.points
  if (body.status) updates.status = body.status
  if (body.minRole) updates.min_role = body.minRole

  const { data, error } = await supabase
    .from("events").update(updates).eq("id", id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/events/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 })
  }

  const { error } = await supabase.from("events").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
