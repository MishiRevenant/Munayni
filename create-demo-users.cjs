const { createClient } = require("@supabase/supabase-js");

// Usamos el SERVICE_ROLE_KEY para tener permisos de administrador y saltar la validación de correo
const SUPABASE_URL = "https://secmwcsybdngljekoxod.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlY213Y3N5YmRuZ2xqZWtveG9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIxMjM1OCwiZXhwIjoyMDk3Nzg4MzU4fQ.1qQIvXjqQRg8sKhXR95oAJFloqcRXm6P1GQ2VUiOaf4";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log("Creando usuarios de prueba en Supabase y confirmando sus correos automáticamente...\n");

  const users = [
    { email: "lucia@raizverde.org", password: "demo1234", name: "Lucía Méndez", role: "usuario" },
    { email: "mateo@raizverde.org", password: "demo1234", name: "Mateo Ríos", role: "lider" },
    { email: "admin@raizverde.org", password: "demo1234", name: "Admin Raíz Verde", role: "admin" }
  ];

  for (const u of users) {
    process.stdout.write(`Creando usuario ${u.email}... `);
    
    // Crear el usuario y autoconfirmar el correo
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true, // ¡ESTO SALTA EL ENVÍO DE CORREO!
      user_metadata: { name: u.name, role: u.role }
    });

    if (error) {
      if (error.message.includes("already registered")) {
        console.log("Ya existía.");
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
    } else {
      console.log("✅ Creado y correo confirmado.");
      
      // Esperar un segundo para que el Trigger de la base de datos termine de crear el Profile
      await new Promise(r => setTimeout(r, 1000));
      
      // Asegurar que el rol sea el correcto en la tabla perfiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: u.role })
        .eq("id", data.user.id);
        
      if (profileError) {
        console.log(`   ⚠️ Nota: No se pudo asignar el rol en la tabla profiles: ${profileError.message}`);
      } else {
        console.log(`   -> Rol asignado como: ${u.role}`);
      }
    }
  }
  
  console.log("\n✅ ¡Todos los usuarios están listos para usar!");
}

main().catch(console.error);
