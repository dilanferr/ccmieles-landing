-- ===================================================================
--  Centro Cristiano Mieles · Turnos y Servidores
--  Equipos + asignaciones de turnos. Acceso: admin, pastor, lider.
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

-- 1) Equipos de servicio
create table if not exists public.equipos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null unique,
  descripcion text,
  orden       int not null default 0,
  activo      boolean not null default true,
  creado_at   timestamptz not null default now()
);

-- 2) Turnos (asignación de un miembro a un equipo en una fecha)
create table if not exists public.turnos_servidores (
  id             uuid primary key default gen_random_uuid(),
  fecha          date not null,
  equipo_id      uuid not null references public.equipos (id) on delete cascade,
  miembro_id     uuid references public.miembros_iglesia (id) on delete set null,
  servicio_id    uuid references public.servicios_semanales (id) on delete set null,
  rol_en_equipo  text,   -- ej: Voz, Guitarra, Cámara, Recepción
  notas          text,
  creado_at      timestamptz not null default now()
);

create index if not exists turnos_fecha_idx  on public.turnos_servidores (fecha);
create index if not exists turnos_equipo_idx on public.turnos_servidores (equipo_id);

-- 3) RLS: admin, pastor y líder gestionan equipos y turnos.
alter table public.equipos enable row level security;
drop policy if exists "equipos_rol" on public.equipos;
create policy "equipos_rol" on public.equipos
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'lider'))
  with check (public.mi_rol() in ('admin', 'pastor', 'lider'));

alter table public.turnos_servidores enable row level security;
drop policy if exists "turnos_rol" on public.turnos_servidores;
create policy "turnos_rol" on public.turnos_servidores
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'lider'))
  with check (public.mi_rol() in ('admin', 'pastor', 'lider'));

-- 4) Directorio SEGURO de miembros: expone SOLO id + nombre (sin datos
--    médicos ni de contacto), para el dropdown de asignación de turnos.
--    Así un líder asigna servidores sin acceder a las fichas sensibles.
create or replace function public.directorio_miembros()
returns table (id uuid, nombre text)
language sql
stable
security definer
set search_path = public
as $$
  select m.id, m.nombre_completo
  from public.miembros_iglesia m
  where public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria')
  order by m.nombre_completo;
$$;

grant execute on function public.directorio_miembros() to authenticated;

-- 5) Sembrado de equipos base.
insert into public.equipos (nombre, orden) values
  ('Alabanza', 1),
  ('Sonido/Multimedia', 2),
  ('Bienvenida', 3),
  ('Niños/Escuela Dominical', 4),
  ('Protocolo', 5)
on conflict (nombre) do nothing;
