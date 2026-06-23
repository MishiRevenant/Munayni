import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/cafeteria — menú
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await supabase
    .from("cafeteria_menu")
    .select("*")
    .eq("available", true)
    .order("category", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
