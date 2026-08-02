-- ===================================================================
--  Centro Cristiano Mieles · Tabla SERVICIOS_SEMANALES
--  Matriz de coordinación de actividades de la iglesia (uso interno del
--  panel). Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

create table if not exists public.servicios_semanales (
  id         uuid primary key default gen_random_uuid(),
  dia        text not null,          -- Domingo … Sábado
  fecha      date,                   -- opcional (fecha puntual del servicio)
  hora       text,                   -- opcional ("19:00" o rango libre)
  actividad  text not null,          -- ej: Culto Dominical, Ensayo de Alabanza
  encargado  text,                   -- usuario/equipo a cargo (opcional)
  creado_at  timestamptz not null default now()
);

-- Índices para ordenar/consultar la matriz con eficiencia.
create index if not exists servicios_semanales_fecha_idx
  on public.servicios_semanales (fecha);
create index if not exists servicios_semanales_creado_at_idx
  on public.servicios_semanales (creado_at);

-- ------------------ Row Level Security ------------------
-- Tabla interna: SOLO el liderazgo autenticado puede leer y gestionar.
-- No hay políticas para anónimos, así que nadie sin sesión accede.
alter table public.servicios_semanales enable row level security;

drop policy if exists "servicios_admin" on public.servicios_semanales;
create policy "servicios_admin" on public.servicios_semanales
  for all to authenticated using (true) with check (true);

-- ===================================================================
--  (OPCIONAL) Sembrado inicial con los horarios reales de la iglesia.
--  Ejecútalo UNA sola vez; si lo corres de nuevo, duplicará las filas.
-- ===================================================================
insert into public.servicios_semanales (dia, hora, actividad) values
  ('Miércoles', '19:00 hrs',        'Culto General'),
  ('Viernes',   '19:00 hrs',        'Culto de Enseñanza Bíblica'),
  ('Sábado',    '16:00 hrs',        'Predicación en la vía pública'),
  ('Sábado',    '16:00 hrs',        'Culto Femenino (Dorcas)'),
  ('Sábado',    '18:00 – 19:30 hrs','Escuela de Música'),
  ('Sábado',    '20:00 – 21:30 hrs','Ensayo de Coro'),
  ('Domingo',   '10:30 – 11:15 hrs','Predicación en la vía pública'),
  ('Domingo',   '11:30 – 14:00 hrs','Culto Familiar y Adoración');
