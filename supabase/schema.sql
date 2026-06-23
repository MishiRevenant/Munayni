-- ============================================================
-- RAÍZ VERDE — Esquema completo + Seed para Supabase
-- ============================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extiende auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'usuario' CHECK (role IN ('usuario', 'lider', 'admin')),
  streak        INT NOT NULL DEFAULT 0,
  points        INT NOT NULL DEFAULT 0,
  events_attended INT NOT NULL DEFAULT 0,
  trees_planted INT NOT NULL DEFAULT 0,
  kg_recycled   NUMERIC(10,2) NOT NULL DEFAULT 0,
  joined        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  avatar_url    TEXT,
  bio           TEXT,
  last_active   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- 2. EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('limpieza','reforestacion','reciclaje','educacion','taller')),
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  location    TEXT NOT NULL,
  description TEXT,
  capacity    INT NOT NULL DEFAULT 30,
  enrolled    INT NOT NULL DEFAULT 0,
  points      INT NOT NULL DEFAULT 50,
  status      TEXT NOT NULL DEFAULT 'abierto' CHECK (status IN ('abierto','lleno','proximamente','finalizado')),
  min_role    TEXT NOT NULL DEFAULT 'usuario' CHECK (min_role IN ('usuario','lider','admin')),
  image_url   TEXT,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by all authenticated users"
  ON public.events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Lideres and admins can insert events"
  ON public.events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('lider', 'admin')
    )
  );

CREATE POLICY "Lideres and admins can update events"
  ON public.events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('lider', 'admin')
    )
  );

CREATE POLICY "Only admins can delete events"
  ON public.events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 3. EVENT ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_enrollments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attended   BOOLEAN DEFAULT FALSE,
  UNIQUE (event_id, user_id)
);

ALTER TABLE public.event_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own enrollments"
  ON public.event_enrollments FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('lider','admin')
  ));

CREATE POLICY "Users can enroll themselves"
  ON public.event_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unenroll themselves"
  ON public.event_enrollments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. REWARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rewards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  cost        INT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('cafeteria','merch','experiencia')),
  min_role    TEXT NOT NULL DEFAULT 'usuario' CHECK (min_role IN ('usuario','lider','admin')),
  available   BOOLEAN NOT NULL DEFAULT TRUE,
  stock       INT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rewards are viewable by all authenticated users"
  ON public.rewards FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage rewards"
  ON public.rewards FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 5. REDEMPTIONS (canjes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.redemptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reward_id   UUID NOT NULL REFERENCES public.rewards(id),
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  points_used INT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status      TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','procesado','cancelado'))
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own redemptions"
  ON public.redemptions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create their own redemptions"
  ON public.redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 6. OPPORTUNITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.opportunities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  org         TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('empleo','voluntariado','beca','convenio')),
  location    TEXT NOT NULL,
  description TEXT,
  min_role    TEXT NOT NULL DEFAULT 'lider' CHECK (min_role IN ('usuario','lider','admin')),
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  deadline    DATE,
  url         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Opportunities viewable by lideres+"
  ON public.opportunities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('lider','admin')
    )
  );

CREATE POLICY "Only admins can manage opportunities"
  ON public.opportunities FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 7. APPLICATIONS (postulaciones)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id  UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message         TEXT,
  applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'enviada' CHECK (status IN ('enviada','revision','aceptada','rechazada')),
  UNIQUE (opportunity_id, user_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can apply"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 8. CAFETERIA MENU
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cafeteria_menu (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  cost        INT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'bebida' CHECK (category IN ('bebida','desayuno','snack','almuerzo')),
  image_url   TEXT,
  available   BOOLEAN NOT NULL DEFAULT TRUE,
  sustainable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cafeteria_menu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menu viewable by authenticated users"
  ON public.cafeteria_menu FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage menu"
  ON public.cafeteria_menu FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 9. CAFETERIA ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cafeteria_orders (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id     UUID NOT NULL REFERENCES public.cafeteria_menu(id),
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  points_used INT NOT NULL,
  ordered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status      TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','preparando','listo','entregado'))
);

ALTER TABLE public.cafeteria_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own orders"
  ON public.cafeteria_orders FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authenticated users can order"
  ON public.cafeteria_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 10. WEEKLY ACTIVITY (para racha)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.weekly_activity (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,
  points      INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (user_id, week_start)
);

ALTER TABLE public.weekly_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own activity"
  ON public.weekly_activity FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('lider','admin')
  ));

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT,
  type        TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  link        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their own notifications as read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Auto-crear perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'usuario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Actualizar enrolled count al inscribirse
CREATE OR REPLACE FUNCTION public.update_event_enrolled()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events
    SET enrolled = enrolled + 1,
        status = CASE WHEN enrolled + 1 >= capacity THEN 'lleno' ELSE status END
    WHERE id = NEW.event_id;

    -- Sumar puntos al usuario
    UPDATE public.profiles
    SET points = points + (SELECT points FROM public.events WHERE id = NEW.event_id),
        events_attended = events_attended + 1
    WHERE id = NEW.user_id;

    -- Notificar
    INSERT INTO public.notifications (user_id, title, body, type)
    SELECT NEW.user_id,
           '¡Inscripción confirmada!',
           '¡Te inscribiste a ' || title || '!',
           'success'
    FROM public.events WHERE id = NEW.event_id;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events
    SET enrolled = GREATEST(0, enrolled - 1),
        status = CASE WHEN status = 'lleno' THEN 'abierto' ELSE status END
    WHERE id = OLD.event_id;

    -- Restar puntos
    UPDATE public.profiles
    SET points = GREATEST(0, points - (SELECT points FROM public.events WHERE id = OLD.event_id)),
        events_attended = GREATEST(0, events_attended - 1)
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_enrollment_change ON public.event_enrollments;
CREATE TRIGGER on_enrollment_change
  AFTER INSERT OR DELETE ON public.event_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_event_enrolled();

-- Actualizar updated_at en events
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_updated_at ON public.events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- SEED DATA — Usuarios de demostración
-- ============================================================
-- Nota: Los usuarios deben crearse via Supabase Auth (la función trigger
-- creará automáticamente sus perfiles). Usamos auth.users directamente.

-- Insertar eventos
INSERT INTO public.events (title, category, date, time, location, description, capacity, enrolled, points, status, min_role, image_url) VALUES
('Limpieza del Río Verde',          'limpieza',      '2026-07-14', '08:00', 'Ribera Norte, Sector 3',    'Jornada de limpieza de orillas y separación de residuos junto al río.',      40, 28, 80,  'abierto',      'usuario', '/river-cleanup-volunteers.png'),
('Reforestación Cerro Azul',        'reforestacion', '2026-07-15', '07:30', 'Cerro Azul, entrada sur',   'Plantación de 200 árboles nativos para recuperar la ladera.',                60, 60, 120, 'lleno',        'usuario', '/people-planting-trees-on-a-hill.png'),
('Punto de Reciclaje Comunitario',  'reciclaje',     '2026-07-18', '16:00', 'Plaza Central',             'Acopio y clasificación de plásticos, vidrio y electrónicos.',                25, 12, 50,  'abierto',      'usuario', '/community-recycling-station.png'),
('Taller: Compostaje en casa',      'taller',        '2026-07-20', '18:00', 'Cafetería Sostenible',      'Aprende a transformar tus residuos orgánicos en abono.',                     30, 19, 40,  'abierto',      'usuario', '/home-composting-workshop.png'),
('Coordinación de Líderes',         'educacion',     '2026-07-23', '19:00', 'Sala de juntas',            'Planeación mensual de campañas. Solo líderes y administración.',             15, 8,  100, 'abierto',      'lider',   '/leadership-meeting-environmental.png'),
('Feria Ambiental Estatal',         'educacion',     '2026-08-05', '10:00', 'Parque Metropolitano',      'Stand del colectivo en alianza con el gobierno estatal.',                    50, 0,  90,  'proximamente', 'usuario', '/environmental-fair-outdoor.png'),
('Brigada de limpieza costera',     'limpieza',      '2026-07-27', '07:00', 'Playa Las Palmas',          'Limpieza de residuos en zona costera con clasificación de desechos.',        35, 14, 90,  'abierto',      'usuario', '/river-cleanup-volunteers.png'),
('Huerto comunitario urbano',       'reforestacion', '2026-07-30', '09:00', 'Jardín Central del Barrio', 'Siembra de hortalizas y hierbas medicinales en huerto colectivo.',           20, 8,  60,  'abierto',      'usuario', '/people-planting-trees-on-a-hill.png'),
('Taller de reciclaje creativo',    'taller',        '2026-08-02', '15:00', 'Centro Cultural El Roble',  'Creación de objetos con materiales reutilizados. Cupo limitado.',            20, 20, 45,  'lleno',        'usuario', '/community-recycling-station.png'),
('Charla: Cambio climático local',  'educacion',     '2026-08-10', '18:00', 'Auditorio Municipal',       'Conferencia con investigadores sobre el impacto del cambio climático.',      100, 0, 30,  'proximamente', 'usuario', '/leadership-meeting-environmental.png');

-- Insertar recompensas
INSERT INTO public.rewards (title, description, cost, category, min_role, available, stock) VALUES
('Café orgánico gratis',            'Un café de especialidad de origen sostenible en la cafetería.',           80,  'cafeteria',  'usuario', TRUE,  NULL),
('Combo desayuno verde',            'Bowl de avena, fruta de temporada y bebida vegetal.',                     180, 'cafeteria',  'usuario', TRUE,  NULL),
('Termo reutilizable Raíz Verde',   'Termo de acero inoxidable con el logo del colectivo.',                   320, 'merch',      'usuario', TRUE,  50),
('Descuento 30% mensual cafetería', 'Beneficio exclusivo por mantener racha semanal activa.',                  500, 'cafeteria',  'lider',   TRUE,  NULL),
('Mesa de líder en cafetería',      'Espacio reservado y bebida ilimitada los fines de semana.',               900, 'experiencia','lider',   TRUE,  10),
('Kit de jardinería premium',       'Herramientas y semillas nativas para tu huerto.',                         600, 'merch',      'usuario', FALSE, 0),
('Tote bag ecológica',              'Bolsa de algodón orgánico con serigrafía del colectivo.',                 150, 'merch',      'usuario', TRUE,  100),
('Visita guiada reserva natural',   'Tour de medio día con guía experto por reserva protegida local.',        1200,'experiencia','lider',   TRUE,  5),
('Cena en restaurante sostenible',  'Para dos personas en restaurante aliado de comercio justo.',              800, 'experiencia','lider',   TRUE,  8),
('Smoothie de temporada gratis',    'Una bebida de frutas locales de temporada sin azúcar añadida.',          120, 'cafeteria',  'usuario', TRUE,  NULL);

-- Insertar oportunidades
INSERT INTO public.opportunities (title, org, type, location, description, min_role, active, deadline) VALUES
('Coordinador/a de campañas de limpieza',     'Secretaría de Medio Ambiente',  'empleo',      'Tiempo completo · Ciudad',     'Convenio con el estado para liderar brigadas urbanas remuneradas.',                   'lider', TRUE, '2026-08-31'),
('Beca de educación ambiental',               'Fundación Tierra Viva',         'beca',        'Híbrido · 6 meses',            'Formación certificada en gestión de proyectos sostenibles.',                           'lider', TRUE, '2026-07-30'),
('Voluntariado internacional de reforestación','Red Verde Latinoamérica',       'voluntariado','Presencial · Costa Rica',      'Intercambio de 3 semanas con colectivos aliados de la región.',                       'lider', TRUE, '2026-08-15'),
('Convenio de prácticas con empresa B',       'EcoLogística S.A.',             'convenio',    'Medio tiempo · Ciudad',        'Prácticas profesionales en logística circular y residuos.',                           'lider', TRUE, '2026-09-01'),
('Instructor/a taller reciclaje',             'Municipio de la Ciudad',        'empleo',      'Medio tiempo · Ciudad',        'Impartir talleres de educación ambiental en escuelas primarias.',                     'lider', TRUE, '2026-08-20'),
('Beca maestría en sostenibilidad',           'Universidad Verde del Sur',     'beca',        'Presencial · 2 años',          'Maestría en Ciencias Ambientales con tutor asignado del colectivo.',                  'lider', TRUE, '2026-07-15'),
('Alianza compostaje municipal',              'Dirección de Residuos Sólidos', 'convenio',    'Ciudad',                       'Gestión y operación de puntos de compostaje comunitario remunerada.',                 'lider', TRUE, '2026-09-30'),
('Monitor ambiental en reserva',              'CONANP',                        'voluntariado','Presencial · 1 mes',           'Apoyo en monitoreo de biodiversidad en área protegida federal.',                      'lider', TRUE, '2026-08-05');

-- Insertar menú de cafetería
INSERT INTO public.cafeteria_menu (name, description, cost, category, image_url, available, sustainable) VALUES
('Café de especialidad',  'Origen orgánico, comercio justo',                    80,  'bebida',   '/specialty-coffee-cup.png',    TRUE, TRUE),
('Bowl de avena verde',   'Avena, fruta de temporada y semillas',               150, 'desayuno', '/green-oatmeal-bowl.png',      TRUE, TRUE),
('Sándwich vegano',       'Pan integral de masa madre con relleno de temporada', 200, 'almuerzo', '/vegan-sandwich.png',          TRUE, TRUE),
('Smoothie de temporada', 'Fruta local sin azúcar añadida',                     120, 'bebida',   '/colorful-fruit-smoothie.png', TRUE, TRUE),
('Granola artesanal',     'Con frutos secos y miel local',                      130, 'desayuno', '/green-oatmeal-bowl.png',      TRUE, TRUE),
('Té de hierbas frescas', 'Mezcla de hierbas del huerto del colectivo',          60, 'bebida',   '/specialty-coffee-cup.png',    TRUE, TRUE),
('Wrap de verduras',      'Tortilla integral con vegetales asados y hummus',     180, 'almuerzo', '/vegan-sandwich.png',          TRUE, TRUE),
('Fruta de temporada',    'Selección local del mercado del día',                  70, 'snack',    '/colorful-fruit-smoothie.png', TRUE, TRUE);
