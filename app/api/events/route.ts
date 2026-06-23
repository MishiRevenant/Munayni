import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/events
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")

  let query = supabase.from("events").select("*").order("date", { ascending: true })
  if (category && category !== "todos") {
    query = query.eq("category", category)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/events (solo lideres/admin)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()

  if (!profile || !["lider", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 })
  }

  const body = await request.json()
  const { data, error } = await supabase.from("events").insert({
    title: body.title,
    category: body.category,
    date: body.date,
    time: body.time || "09:00",
    location: body.location,
    description: body.description,
    capacity: body.capacity || 30,
    points: body.points || 50,
    min_role: body.minRole || "usuario",
    status: "abierto",
    image_url: body.imageUrl || null,
    created_by: user.id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
