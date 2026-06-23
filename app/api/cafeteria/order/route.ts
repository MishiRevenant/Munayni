import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/cafeteria/order
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const { itemId } = body

  // Obtener ítem
  const { data: item } = await supabase
    .from("cafeteria_menu").select("*").eq("id", itemId).single()
  if (!item) return NextResponse.json({ error: "Ítem no encontrado" }, { status: 404 })
  if (!item.available) return NextResponse.json({ error: "Ítem no disponible" }, { status: 400 })

  // Verificar puntos del usuario y racha
  const { data: profile } = await supabase
    .from("profiles").select("points, streak").eq("id", user.id).single()
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
  if (profile.streak < 1) return NextResponse.json({ error: "Necesitas racha activa para pedir" }, { status: 403 })
  if (profile.points < item.cost) return NextResponse.json({ error: "Puntos insuficientes" }, { status: 400 })

  // Crear pedido
  const { error: orderError } = await supabase.from("cafeteria_orders").insert({
    item_id: itemId,
    user_id: user.id,
    points_used: item.cost,
  })
  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  // Descontar puntos
  const { error: pointsError } = await supabase
    .from("profiles")
    .update({ points: profile.points - item.cost })
    .eq("id", user.id)
  if (pointsError) return NextResponse.json({ error: pointsError.message }, { status: 500 })

  return NextResponse.json({ success: true, pointsUsed: item.cost })
}
