import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/rewards/[id]/redeem
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: rewardId } = await params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  // Obtener recompensa
  const { data: reward } = await supabase
    .from("rewards").select("*").eq("id", rewardId).single()
  if (!reward) return NextResponse.json({ error: "Recompensa no encontrada" }, { status: 404 })
  if (!reward.available) return NextResponse.json({ error: "Recompensa no disponible" }, { status: 400 })

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from("profiles").select("points, role").eq("id", user.id).single()
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })

  const roleRank: Record<string, number> = { usuario: 0, lider: 1, admin: 2 }
  if (roleRank[profile.role] < roleRank[reward.min_role]) {
    return NextResponse.json({ error: "Rol insuficiente para esta recompensa" }, { status: 403 })
  }
  if (profile.points < reward.cost) {
    return NextResponse.json({ error: "Puntos insuficientes" }, { status: 400 })
  }

  // Verificar si ya canjeó
  const { data: existing } = await supabase
    .from("redemptions")
    .select("id")
    .eq("reward_id", rewardId)
    .eq("user_id", user.id)
    .eq("status", "pendiente")
    .single()

  if (existing) return NextResponse.json({ error: "Ya canjeaste esta recompensa" }, { status: 400 })

  // Crear canje y descontar puntos en transacción
  const { error: redeemError } = await supabase
    .from("redemptions").insert({
      reward_id: rewardId,
      user_id: user.id,
      points_used: reward.cost,
    })
  if (redeemError) return NextResponse.json({ error: redeemError.message }, { status: 500 })

  const { error: pointsError } = await supabase
    .from("profiles")
    .update({ points: profile.points - reward.cost })
    .eq("id", user.id)
  if (pointsError) return NextResponse.json({ error: pointsError.message }, { status: 500 })

  // Si tiene stock, descontar
  if (reward.stock !== null) {
    await supabase.from("rewards")
      .update({
        stock: Math.max(0, reward.stock - 1),
        available: reward.stock - 1 > 0,
      })
      .eq("id", rewardId)
  }

  // Notificación
  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "¡Recompensa canjeada!",
    body: `${reward.title} · -${reward.cost} pts`,
    type: "success",
  })

  return NextResponse.json({ success: true, pointsUsed: reward.cost })
}
