-- ===================================================================
--  Centro Cristiano Mieles · Tabla CLASIFICADOS (diario mural)
--  Avisos de servicios/oficios que ofrecen los hermanos.
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

create table if not exists public.clasificados (
  id          uuid primary key default gen_random_uuid(),
  categoria   text not null,
  titulo      text not null,
  descripcion text not null,
  autor       text not null,
  creado_at   timestamptz not null default now()
);

alter table public.clasificados enable row level security;

-- Lectura pública (para el diario mural en /comunidad).
drop policy if exists "clasificados_lectura_publica" on public.clasificados;
create policy "clasificados_lectura_publica" on public.clasificados
  for select using (true);

-- Crear / editar / eliminar solo el liderazgo autenticado (panel).
drop policy if exists "clasificados_admin" on public.clasificados;
create policy "clasificados_admin" on public.clasificados
  for all to authenticated using (true) with check (true);
