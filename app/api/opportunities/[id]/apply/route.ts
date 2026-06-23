import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/opportunities/[id]/apply
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: opportunityId } = await params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()

  const roleRank: Record<string, number> = { usuario: 0, lider: 1, admin: 2 }

  const { data: opp } = await supabase
    .from("opportunities").select("min_role, title").eq("id", opportunityId).single()

  if (!opp) return NextResponse.json({ error: "Oportunidad no encontrada" }, { status: 404 })
  if (roleRank[profile?.role ?? "usuario"] < roleRank[opp.min_role]) {
    return NextResponse.json({ error: "Rol insuficiente" }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const { error } = await supabase.from("applications").insert({
    opportunity_id: opportunityId,
    user_id: user.id,
    message: body.message ?? null,
  })

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Ya postulaste" }, { status: 400 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notificación
  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "¡Postulación enviada!",
    body: `Tu postulación a "${opp.title}" fue registrada.`,
    type: "success",
  })

  return NextResponse.json({ success: true })
}
