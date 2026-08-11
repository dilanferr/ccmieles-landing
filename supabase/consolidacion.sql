-- ===================================================================
--  Centro Cristiano Mieles · Consolidación de Visitantes (Fase 2A)
--  Pipeline pastoral: Recibido → Contactado → En Proceso → Integrado.
--  Tablas consolidacion / consolidacion_notas + RLS + auditoría (M8)
--  + soft-delete (entra a la Papelera).
--  Equipo de consolidación: admin, pastor, lider, secretaria (roles existentes).
--  Requiere: public.mi_rol(), public.fn_audit_log_trigger(),
--            public.perfiles, public.miembros_iglesia, public.asistencias.
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

-- 1) Personas en el recorrido de consolidación (una fila por persona).
create table if not exists public.consolidacion (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  telefono        text,
  email           text,
  direccion       text,
  estado          text not null default 'recibido'
                    check (estado in ('recibido', 'contactado', 'en_proceso',
                                      'integrado', 'no_continua')),
  responsable_id  uuid references public.perfiles (id) on delete set null,
  origen          text not null default 'manual'
                    check (origen in ('asistencia', 'manual', 'web')),
  asistencia_id   uuid references public.asistencias (id) on delete set null,
  miembro_id      uuid references public.miembros_iglesia (id) on delete set null,
  bautizado       boolean not null default false,
  fecha_bautismo  date,
  fecha_recepcion date not null default current_date,
  eliminado_at    timestamptz,        -- soft-delete (Papelera)
  creado_at       timestamptz not null default now(),
  actualizado_at  timestamptz not null default now()
);

-- Un mismo check-in no puede generar dos consolidaciones activas (idempotencia
-- del botón "→ Consolidar" desde Asistencia).
create unique index if not exists consolidacion_asistencia_unq
  on public.consolidacion (asistencia_id)
  where asistencia_id is not null and eliminado_at is null;
create index if not exists consolidacion_estado_idx
  on public.consolidacion (estado) where eliminado_at is null;
create index if not exists consolidacion_responsable_idx
  on public.consolidacion (responsable_id) where eliminado_at is null;

alter table public.consolidacion enable row level security;
drop policy if exists "consolidacion_rol" on public.consolidacion;
create policy "consolidacion_rol" on public.consolidacion
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'))
  with check (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'));

-- 2) Historial pastoral: notas en línea de tiempo (append-only por diseño).
create table if not exists public.consolidacion_notas (
  id               uuid primary key default gen_random_uuid(),
  consolidacion_id uuid not null references public.consolidacion (id) on delete cascade,
  autor_id         uuid references public.perfiles (id) on delete set null,
  tipo             text not null default 'general'
                     check (tipo in ('llamada', 'visita', 'oracion', 'general')),
  nota             text not null,
  creado_at        timestamptz not null default now()
);
create index if not exists consolidacion_notas_padre_idx
  on public.consolidacion_notas (consolidacion_id, creado_at desc);

alter table public.consolidacion_notas enable row level security;
drop policy if exists "consolidacion_notas_rol" on public.consolidacion_notas;
create policy "consolidacion_notas_rol" on public.consolidacion_notas
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'))
  with check (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'));

-- 3) Auditoría inalterable (M8) sobre ambas tablas.
drop trigger if exists trg_audit on public.consolidacion;
create trigger trg_audit
  after insert or update or delete on public.consolidacion
  for each row execute function public.fn_audit_log_trigger();

drop trigger if exists trg_audit on public.consolidacion_notas;
create trigger trg_audit
  after insert or update or delete on public.consolidacion_notas
  for each row execute function public.fn_audit_log_trigger();

-- ===================================================================
--  VERIFICACIÓN (opcional):
--    select tablename, policyname, cmd from pg_policies
--    where tablename in ('consolidacion','consolidacion_notas');
-- ===================================================================
