#!/usr/bin/env node
/**
 * Crea el schema en Supabase usando pg via conexión directa.
 * Usa el módulo 'pg' de Node (si está instalado) o fetch a la API.
 */

const SUPABASE_URL = "https://secmwcsybdngljekoxod.supabase.co"
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlY213Y3N5YmRuZ2xqZWtveG9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIxMjM1OCwiZXhwIjoyMDk3Nzg4MzU4fQ.1qQIvXjqQRg8sKhXR95oAJFloqcRXm6P1GQ2VUiOaf4"

// Supabase expone un endpoint para ejecutar SQL via service_role
// usando la función pg_execute (solo Supabase Pro) o via Edge Functions.
// La alternativa es usar el cliente JS con .rpc()

// Intentaremos via el endpoint /pg que Supabase no expone por defecto.
// La mejor solución sin psql es usar @supabase/supabase-js con un script de setup.

const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
})

async function createTables() {
  console.log("Creando tablas via Supabase client...")
  
  // Verificar conexión
  const { data, error } = await supabase.from("profiles").select("count").limit(1)
  if (error && error.code === "PGRST205") {
    console.log("❌ Tabla 'profiles' no existe. Necesita crearse via SQL Editor en Supabase Dashboard.")
    console.log("\n⚠️  ACCIÓN REQUERIDA:")
    console.log("1. Ve a: https://supabase.com/dashboard/project/secmwcsybdngljekoxod/sql/new")
    console.log("2. Copia y pega el contenido de: supabase/schema.sql")
    console.log("3. Haz clic en 'Run'")
    console.log("4. Luego ejecuta: node supabase/seed.cjs")
    return false
  }
  
  if (error) {
    console.log("Error de conexión:", error.message)
    return false
  }
  
  console.log("✅ Tablas ya existen. Procediendo con seed...")
  return true
}

async function seedData() {
  const events = [
    { title: "Limpieza del Río Verde", category: "limpieza", date: "2026-07-14", time: "08:00:00", location: "Ribera Norte, Sector 3", description: "Jornada de limpieza de orillas y separación de residuos junto al río.", capacity: 40, enrolled: 28, points: 80, status: "abierto", min_role: "usuario", image_url: "/river-cleanup-volunteers.png" },
    { title: "Reforestación Cerro Azul", category: "reforestacion", date: "2026-07-15", time: "07:30:00", location: "Cerro Azul, entrada sur", description: "Plantación de 200 árboles nativos para recuperar la ladera.", capacity: 60, enrolled: 60, points: 120, status: "lleno", min_role: "usuario", image_url: "/people-planting-trees-on-a-hill.png" },
    { title: "Punto de Reciclaje Comunitario", category: "reciclaje", date: "2026-07-18", time: "16:00:00", location: "Plaza Central", description: "Acopio y clasificación de plásticos, vidrio y electrónicos.", capacity: 25, enrolled: 12, points: 50, status: "abierto", min_role: "usuario", image_url: "/community-recycling-station.png" },
    { title: "Taller: Compostaje en casa", category: "taller", date: "2026-07-20", time: "18:00:00", location: "Cafetería Sostenible", description: "Aprende a transformar tus residuos orgánicos en abono.", capacity: 30, enrolled: 19, points: 40, status: "abierto", min_role: "usuario", image_url: "/home-composting-workshop.png" },
    { title: "Coordinación de Líderes Ambientales", category: "educacion", date: "2026-07-23", time: "19:00:00", location: "Sala de juntas", description: "Planeación mensual de campañas. Solo líderes y administración.", capacity: 15, enrolled: 8, points: 100, status: "abierto", min_role: "lider", image_url: "/leadership-meeting-environmental.png" },
    { title: "Feria Ambiental Estatal", category: "educacion", date: "2026-08-05", time: "10:00:00", location: "Parque Metropolitano", description: "Stand del colectivo en alianza con el gobierno estatal.", capacity: 50, enrolled: 0, points: 90, status: "proximamente", min_role: "usuario", image_url: "/environmental-fair-outdoor.png" },
    { title: "Brigada de limpieza costera", category: "limpieza", date: "2026-07-27", time: "07:00:00", location: "Playa Las Palmas", description: "Limpieza de residuos en zona costera con clasificación de desechos.", capacity: 35, enrolled: 14, points: 90, status: "abierto", min_role: "usuario", image_url: "/river-cleanup-volunteers.png" },
    { title: "Huerto comunitario urbano", category: "reforestacion", date: "2026-07-30", time: "09:00:00", location: "Jardín Central del Barrio", description: "Siembra de hortalizas y hierbas medicinales en huerto colectivo.", capacity: 20, enrolled: 8, points: 60, status: "abierto", min_role: "usuario", image_url: "/people-planting-trees-on-a-hill.png" },
    { title: "Taller de reciclaje creativo", category: "taller", date: "2026-08-02", time: "15:00:00", location: "Centro Cultural El Roble", description: "Creación de objetos con materiales reutilizados. Cupo limitado.", capacity: 20, enrolled: 20, points: 45, status: "lleno", min_role: "usuario", image_url: "/community-recycling-station.png" },
    { title: "Charla: Cambio climático local", category: "educacion", date: "2026-08-10", time: "18:00:00", location: "Auditorio Municipal", description: "Conferencia con investigadores sobre el impacto del cambio climático.", capacity: 100, enrolled: 0, points: 30, status: "proximamente", min_role: "usuario", image_url: "/leadership-meeting-environmental.png" },
  ]

  const { error: evErr } = await supabase.from("events").insert(events)
  if (evErr) console.log("❌ Eventos:", evErr.message)
  else console.log(`✅ ${events.length} eventos insertados`)

  const rewards = [
    { title: "Café orgánico gratis", description: "Un café de especialidad de origen sostenible en la cafetería.", cost: 80, category: "cafeteria", min_role: "usuario", available: true },
    { title: "Combo desayuno verde", description: "Bowl de avena, fruta de temporada y bebida vegetal.", cost: 180, category: "cafeteria", min_role: "usuario", available: true },
    { title: "Termo reutilizable Raíz Verde", description: "Termo de acero inoxidable con el logo del colectivo.", cost: 320, category: "merch", min_role: "usuario", available: true, stock: 50 },
    { title: "Descuento 30% mensual cafetería", description: "Beneficio exclusivo por mantener racha semanal activa.", cost: 500, category: "cafeteria", min_role: "lider", available: true },
    { title: "Mesa de líder en cafetería", description: "Espacio reservado y bebida ilimitada los fines de semana.", cost: 900, category: "experiencia", min_role: "lider", available: true, stock: 10 },
    { title: "Kit de jardinería premium", description: "Herramientas y semillas nativas para tu huerto.", cost: 600, category: "merch", min_role: "usuario", available: false, stock: 0 },
    { title: "Tote bag ecológica", description: "Bolsa de algodón orgánico con serigrafía del colectivo.", cost: 150, category: "merch", min_role: "usuario", available: true, stock: 100 },
    { title: "Visita guiada reserva natural", description: "Tour de medio día con guía experto por reserva protegida local.", cost: 1200, category: "experiencia", min_role: "lider", available: true, stock: 5 },
    { title: "Cena en restaurante sostenible", description: "Para dos personas en restaurante aliado de comercio justo.", cost: 800, category: "experiencia", min_role: "lider", available: true, stock: 8 },
    { title: "Smoothie de temporada gratis", description: "Una bebida de frutas locales de temporada sin azúcar añadida.", cost: 120, category: "cafeteria", min_role: "usuario", available: true },
  ]

  const { error: rwErr } = await supabase.from("rewards").insert(rewards)
  if (rwErr) console.log("❌ Recompensas:", rwErr.message)
  else console.log(`✅ ${rewards.length} recompensas insertadas`)

  const opps = [
    { title: "Coordinador/a de campañas de limpieza", org: "Secretaría de Medio Ambiente", type: "empleo", location: "Tiempo completo · Ciudad", description: "Convenio con el estado para liderar brigadas urbanas remuneradas.", min_role: "lider", active: true, deadline: "2026-08-31" },
    { title: "Beca de educación ambiental", org: "Fundación Tierra Viva", type: "beca", location: "Híbrido · 6 meses", description: "Formación certificada en gestión de proyectos sostenibles.", min_role: "lider", active: true, deadline: "2026-07-30" },
    { title: "Voluntariado internacional de reforestación", org: "Red Verde Latinoamérica", type: "voluntariado", location: "Presencial · Costa Rica", description: "Intercambio de 3 semanas con colectivos aliados de la región.", min_role: "lider", active: true, deadline: "2026-08-15" },
    { title: "Convenio de prácticas con empresa B", org: "EcoLogística S.A.", type: "convenio", location: "Medio tiempo · Ciudad", description: "Prácticas profesionales en logística circular y residuos.", min_role: "lider", active: true, deadline: "2026-09-01" },
    { title: "Instructor/a taller reciclaje", org: "Municipio de la Ciudad", type: "empleo", location: "Medio tiempo · Ciudad", description: "Impartir talleres de educación ambiental en escuelas primarias.", min_role: "lider", active: true, deadline: "2026-08-20" },
    { title: "Beca maestría en sostenibilidad", org: "Universidad Verde del Sur", type: "beca", location: "Presencial · 2 años", description: "Maestría en Ciencias Ambientales con tutor asignado del colectivo.", min_role: "lider", active: true, deadline: "2026-07-15" },
    { title: "Alianza compostaje municipal", org: "Dirección de Residuos Sólidos", type: "convenio", location: "Ciudad", description: "Gestión y operación de puntos de compostaje comunitario remunerada.", min_role: "lider", active: true, deadline: "2026-09-30" },
    { title: "Monitor ambiental en reserva", org: "CONANP", type: "voluntariado", location: "Presencial · 1 mes", description: "Apoyo en monitoreo de biodiversidad en área protegida federal.", min_role: "lider", active: true, deadline: "2026-08-05" },
  ]

  const { error: opErr } = await supabase.from("opportunities").insert(opps)
  if (opErr) console.log("❌ Oportunidades:", opErr.message)
  else console.log(`✅ ${opps.length} oportunidades insertadas`)

  const menu = [
    { name: "Café de especialidad", description: "Origen orgánico, comercio justo", cost: 80, category: "bebida", image_url: "/specialty-coffee-cup.png", available: true, sustainable: true },
    { name: "Bowl de avena verde", description: "Avena, fruta de temporada y semillas", cost: 150, category: "desayuno", image_url: "/green-oatmeal-bowl.png", available: true, sustainable: true },
    { name: "Sándwich vegano", description: "Pan integral de masa madre con relleno de temporada", cost: 200, category: "almuerzo", image_url: "/vegan-sandwich.png", available: true, sustainable: true },
    { name: "Smoothie de temporada", description: "Fruta local sin azúcar añadida", cost: 120, category: "bebida", image_url: "/colorful-fruit-smoothie.png", available: true, sustainable: true },
    { name: "Granola artesanal", description: "Con frutos secos y miel local", cost: 130, category: "desayuno", image_url: "/green-oatmeal-bowl.png", available: true, sustainable: true },
    { name: "Té de hierbas frescas", description: "Mezcla de hierbas del huerto del colectivo", cost: 60, category: "bebida", image_url: "/specialty-coffee-cup.png", available: true, sustainable: true },
    { name: "Wrap de verduras", description: "Tortilla integral con vegetales asados y hummus", cost: 180, category: "almuerzo", image_url: "/vegan-sandwich.png", available: true, sustainable: true },
    { name: "Fruta de temporada", description: "Selección local del mercado del día", cost: 70, category: "snack", image_url: "/colorful-fruit-smoothie.png", available: true, sustainable: true },
  ]

  const { error: menuErr } = await supabase.from("cafeteria_menu").insert(menu)
  if (menuErr) console.log("❌ Menú:", menuErr.message)
  else console.log(`✅ ${menu.length} items de menú insertados`)
}

createTables().then(async (ok) => {
  if (ok) await seedData()
  console.log("\nListo.")
}).catch(console.error)
