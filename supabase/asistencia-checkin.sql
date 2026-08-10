-- ===================================================================
--  Centro Cristiano Mieles · Asistencia y Check-in (Fase 1)
--  Tablas eventos_cultos / asistencias + RLS + auditoría (M8) + soft-delete.
--  Registran asistencia: admin, pastor, lider, secretaria (roles existentes).
--  Requiere: public.mi_rol(), public.fn_audit_log_trigger(),
--            public.miembros_iglesia.
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

-- 1) Sesiones donde se toma asistencia (culto o evento puntual).
create table if not exists public.eventos_cultos (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,
  tipo           text not null default 'culto' check (tipo in ('culto', 'evento')),
  fecha          date not null default current_date,
  hora           text,
  descripcion    text,
  eliminado_at   timestamptz,        -- soft-delete
  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);
create index if not exists eventos_cultos_fecha_idx
  on public.eventos_cultos (fecha desc);

alter table public.eventos_cultos enable row level security;
drop policy if exists "eventos_cultos_rol" on public.eventos_cultos;
create policy "eventos_cultos_rol" on public.eventos_cultos
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'))
  with check (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'));

-- 2) Asistencias: una fila por persona presente en una sesión.
create table if not exists public.asistencias (
  id               uuid primary key default gen_random_uuid(),
  evento_culto_id  uuid not null references public.eventos_cultos (id) on delete cascade,
  miembro_id       uuid references public.miembros_iglesia (id) on delete set null,
  visitante_nombre text,
  tipo_asistente   text not null default 'miembro'
                     check (tipo_asistente in ('miembro', 'visitante')),
  notas            text,
  eliminado_at     timestamptz,       -- soft-delete (check-out reversible)
  registrado_at    timestamptz not null default now(),
  -- Coherencia miembro/visitante.
  constraint asistencias_tipo_check check (
    (tipo_asistente = 'miembro' and miembro_id is not null)
    or (tipo_asistente = 'visitante' and visitante_nombre is not null)
  )
);

-- Un miembro no puede quedar registrado dos veces (activo) en la misma sesión.
create unique index if not exists asistencias_unq
  on public.asistencias (evento_culto_id, miembro_id)
  where miembro_id is not null and eliminado_at is null;
create index if not exists asistencias_evento_idx
  on public.asistencias (evento_culto_id);

alter table public.asistencias enable row level security;
drop policy if exists "asistencias_rol" on public.asistencias;
create policy "asistencias_rol" on public.asistencias
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'))
  with check (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'));

-- 3) Auditoría inalterable (M8) sobre ambas tablas.
drop trigger if exists trg_audit on public.eventos_cultos;
create trigger trg_audit
  after insert or update or delete on public.eventos_cultos
  for each row execute function public.fn_audit_log_trigger();

drop trigger if exists trg_audit on public.asistencias;
create trigger trg_audit
  after insert or update or delete on public.asistencias
  for each row execute function public.fn_audit_log_trigger();

-- ===================================================================
--  VERIFICACIÓN (opcional):
--    select tablename, policyname, cmd from pg_policies
--    where tablename in ('eventos_cultos','asistencias');
-- ===================================================================
