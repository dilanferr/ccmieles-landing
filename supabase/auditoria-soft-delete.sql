-- ===================================================================
--  Centro Cristiano Mieles · Auditoría + Soft-Delete
--  1) Tabla audit_log (bitácora de acciones sensibles).
--  2) Columna eliminado_at en finanzas y fichas (borrado reversible).
--  3) directorio_miembros() actualizado para excluir eliminados.
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

-- 1) Registro de auditoría ------------------------------------------
create table if not exists public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users (id) on delete set null,
  accion     text not null check (accion in ('CREAR', 'EDITAR', 'ELIMINAR')),
  modulo     text not null,          -- 'finanzas' | 'miembros' | 'usuarios'
  detalles   jsonb,                  -- resumen no sensible de la operación
  creado_at  timestamptz not null default now()
);

create index if not exists audit_log_creado_idx on public.audit_log (creado_at desc);
create index if not exists audit_log_modulo_idx on public.audit_log (modulo, creado_at desc);

alter table public.audit_log enable row level security;

-- Cada usuario sólo puede registrar SU propia acción (usuario_id = auth.uid()).
drop policy if exists "audit_insert" on public.audit_log;
create policy "audit_insert" on public.audit_log
  for insert to authenticated
  with check (usuario_id = auth.uid());

-- La bitácora sólo la leen admin y pastor.
drop policy if exists "audit_read" on public.audit_log;
create policy "audit_read" on public.audit_log
  for select to authenticated
  using (public.mi_rol() in ('admin', 'pastor'));

-- 2) Soft-delete (borrado reversible) -------------------------------
alter table public.miembros_iglesia
  add column if not exists eliminado_at timestamptz;
alter table public.transacciones_financieras
  add column if not exists eliminado_at timestamptz;

-- 3) directorio_miembros(): excluir fichas eliminadas ---------------
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
    and m.eliminado_at is null
  order by m.nombre_completo;
$$;

grant execute on function public.directorio_miembros() to authenticated;
