-- ===================================================================
--  Centro Cristiano Mieles · Tabla MIEMBROS_IGLESIA (Registro Pastoral)
--  Datos SENSIBLES (personales, médicos, firma). Uso interno del panel.
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

create table if not exists public.miembros_iglesia (
  id                            uuid primary key default gen_random_uuid(),
  -- Datos personales y de contacto
  nombre_completo               text not null,
  rut                           text,
  telefono                      text,
  correo                        text,
  direccion                     text,
  fecha_nacimiento              date,
  -- Ficha médica y de emergencia
  salud                         text,   -- alergias, condiciones, medicamentos…
  tipo_sangre                   text,   -- A+, O-, …
  contacto_emergencia_nombre    text,
  contacto_emergencia_telefono  text,
  -- Conformidad
  firma                         text,   -- data URL (imagen PNG en base64)
  -- Auditoría
  creado_at                     timestamptz not null default now(),
  actualizado_at                timestamptz not null default now()
);

-- Índices para el buscador (nombre y RUT).
create index if not exists miembros_iglesia_nombre_idx
  on public.miembros_iglesia (nombre_completo);
create index if not exists miembros_iglesia_rut_idx
  on public.miembros_iglesia (rut);

-- ------------------ Row Level Security (ESTRICTA) ------------------
-- Datos sensibles: SOLO el liderazgo autenticado puede leer y gestionar.
-- No existe ninguna política para anónimos, así que nadie sin sesión accede.
alter table public.miembros_iglesia enable row level security;

drop policy if exists "miembros_admin" on public.miembros_iglesia;
create policy "miembros_admin" on public.miembros_iglesia
  for all to authenticated using (true) with check (true);
