import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Role } from "@/lib/types"

// GET /api/members
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!["lider", "admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("profiles").select("*").order("joined", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/members — cambiar rol
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 })
  }

  const body = await request.json()
  const validRoles: Role[] = ["usuario", "lider", "admin"]
  if (!validRoles.includes(body.role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
  }

  const { error } = await supabase
    .from("profiles").update({ role: body.role }).eq("id", body.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE /api/members?userId=xxx
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 })
  if (userId === user.id) return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 })

  // Eliminar perfil (la FK CASCADE borrará registros relacionados)
  const { error } = await supabase.from("profiles").delete().eq("id", userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
