-- ===================================================================
--  Centro Cristiano Mieles · Inventario y Bienes (Fase 1)
--  Rol 'logistica' + tablas bienes / prestamos_bienes + RLS + auditoría.
--  Requiere: public.mi_rol(), public.fn_audit_log_trigger(),
--            public.miembros_iglesia, public.directorio_miembros().
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

-- 1) Nuevo rol 'logistica' en el check de perfiles.
alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check
  check (rol in ('admin', 'pastor', 'tesorero', 'lider', 'secretaria',
                 'intercesion', 'logistica'));

-- 2) Estado del bien como ENUM (ciclo de vida fijo).
do $$
begin
  create type public.estado_bien as enum
    ('nuevo', 'bueno', 'regular', 'reparacion', 'baja');
exception
  when duplicate_object then null;
end $$;

-- 3) Categorías como TABLA de referencia (extensible desde el panel).
create table if not exists public.categorias_bien (
  nombre text primary key,
  orden  int not null default 0,
  activo boolean not null default true
);
alter table public.categorias_bien enable row level security;

drop policy if exists "categorias_bien_rol" on public.categorias_bien;
create policy "categorias_bien_rol" on public.categorias_bien
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'logistica'))
  with check (public.mi_rol() in ('admin', 'pastor', 'logistica'));

insert into public.categorias_bien (nombre, orden) values
  ('Instrumentos', 1),
  ('Audio/Video', 2),
  ('Mobiliario', 3),
  ('Cocina', 4),
  ('Aseo/Mantención', 5),
  ('Otros', 9)
on conflict (nombre) do nothing;

-- 4) Tabla de bienes (catálogo).
create table if not exists public.bienes (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null,
  categoria         text not null
                      references public.categorias_bien (nombre) on update cascade,
  cantidad          int not null default 1 check (cantidad >= 0),
  estado            public.estado_bien not null default 'bueno',
  ubicacion         text,
  responsable_id    uuid references public.miembros_iglesia (id) on delete set null,
  valor             numeric(14,2) not null default 0 check (valor >= 0),
  fecha_adquisicion date,
  nro_serie         text,
  foto_url          text,
  notas             text,
  eliminado_at      timestamptz,          -- soft-delete (patrón del proyecto)
  creado_at         timestamptz not null default now(),
  actualizado_at    timestamptz not null default now()
);
create index if not exists bienes_categoria_idx on public.bienes (categoria);
create index if not exists bienes_estado_idx    on public.bienes (estado);

alter table public.bienes enable row level security;
drop policy if exists "bienes_rol" on public.bienes;
create policy "bienes_rol" on public.bienes
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'logistica'))
  with check (public.mi_rol() in ('admin', 'pastor', 'logistica'));

-- 5) Tabla de préstamos (movimientos). fecha_devolucion_real IS NULL = prestado.
create table if not exists public.prestamos_bienes (
  id                        uuid primary key default gen_random_uuid(),
  bien_id                   uuid not null references public.bienes (id) on delete cascade,
  miembro_id                uuid references public.miembros_iglesia (id) on delete set null,
  cantidad                  int not null default 1 check (cantidad > 0),
  fecha_prestamo            date not null default current_date,
  fecha_devolucion_esperada date,
  fecha_devolucion_real     date,
  notas                     text,
  creado_at                 timestamptz not null default now()
);
create index if not exists prestamos_bien_idx on public.prestamos_bienes (bien_id);
create index if not exists prestamos_abiertos_idx
  on public.prestamos_bienes (bien_id) where fecha_devolucion_real is null;

alter table public.prestamos_bienes enable row level security;
drop policy if exists "prestamos_rol" on public.prestamos_bienes;
create policy "prestamos_rol" on public.prestamos_bienes
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'logistica'))
  with check (public.mi_rol() in ('admin', 'pastor', 'logistica'));

-- 6) Auditoría inalterable (M8) sobre las dos tablas nuevas.
drop trigger if exists trg_audit on public.bienes;
create trigger trg_audit
  after insert or update or delete on public.bienes
  for each row execute function public.fn_audit_log_trigger();

drop trigger if exists trg_audit on public.prestamos_bienes;
create trigger trg_audit
  after insert or update or delete on public.prestamos_bienes
  for each row execute function public.fn_audit_log_trigger();

-- 7) directorio_miembros(): añadir 'logistica' (dropdown de responsable/prestatario).
create or replace function public.directorio_miembros()
returns table (id uuid, nombre text)
language sql
stable
security definer
set search_path = public
as $$
  select m.id, m.nombre_completo
  from public.miembros_iglesia m
  where public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria', 'logistica')
    and m.eliminado_at is null
  order by m.nombre_completo;
$$;
grant execute on function public.directorio_miembros() to authenticated;

-- ===================================================================
--  VERIFICACIÓN (opcional):
--   · Asigna el rol a un usuario de prueba:
--       update public.perfiles set rol='logistica' where correo='...';
--   · Comprueba las políticas:
--       select tablename, policyname, cmd from pg_policies
--       where tablename in ('bienes','prestamos_bienes','categorias_bien');
-- ===================================================================
