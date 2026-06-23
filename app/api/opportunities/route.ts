import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/opportunities
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()

  const roleRank: Record<string, number> = { usuario: 0, lider: 1, admin: 2 }
  const minRank = roleRank[profile?.role ?? "usuario"]

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filtrar por rol mínimo
  const filtered = (data ?? []).filter(
    (o: { min_role: string }) => minRank >= roleRank[o.min_role]
  )

  return NextResponse.json(filtered)
}

// POST /api/opportunities (solo admin)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 })
  }

  const body = await request.json()
  const { data, error } = await supabase.from("opportunities").insert({
    title: body.title,
    org: body.org,
    type: body.type,
    location: body.location,
    description: body.description,
    min_role: body.minRole || "lider",
    active: true,
    deadline: body.deadline ?? null,
    url: body.url ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
