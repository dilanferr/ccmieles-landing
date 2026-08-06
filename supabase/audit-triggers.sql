-- ===================================================================
--  Centro Cristiano Mieles · Auditoría por TRIGGERS de BD (Fase 2 · M8)
--
--  Convierte la bitácora en INALTERABLE a nivel de aplicación: la captura
--  ocurre dentro de PostgreSQL (AFTER INSERT/UPDATE/DELETE), con una función
--  SECURITY DEFINER. Ninguna Server Action ni escritura directa por REST
--  puede saltarse el registro.
--
--  Reutiliza la tabla public.audit_log (creada en auditoria-soft-delete.sql),
--  ampliándola con: tabla, registro_id, old_record, new_record.
--
--  Requiere que public.audit_log y auth.uid() ya existan.
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

-- 1) Ampliar el esquema de audit_log (superset; compatible con filas legacy)
alter table public.audit_log
  add column if not exists tabla       text,
  add column if not exists registro_id text,
  add column if not exists old_record  jsonb,
  add column if not exists new_record  jsonb;

-- Las filas de trigger no traen modulo/detalles (eran del registro app-level).
alter table public.audit_log alter column modulo drop not null;

-- Admitir las acciones de trigger (INSERT/UPDATE/DELETE) además de las legacy.
alter table public.audit_log drop constraint if exists audit_log_accion_check;
alter table public.audit_log add constraint audit_log_accion_check
  check (accion in ('INSERT', 'UPDATE', 'DELETE', 'CREAR', 'EDITAR', 'ELIMINAR'));

create index if not exists audit_log_tabla_idx
  on public.audit_log (tabla, creado_at desc);

-- 2) A prueba de manipulación: la app NO debe poder insertar ni alterar la
--    bitácora. Sólo el trigger (SECURITY DEFINER) escribe; admin/pastor leen.
drop policy if exists "audit_insert" on public.audit_log;   -- evita filas forjadas
-- (se conserva "audit_read": select para admin/pastor)

-- 3) Función genérica de auditoría --------------------------------------------
--    SECURITY DEFINER: corre como dueño de la función → bypassa RLS al insertar
--    en audit_log, garantizando que el registro SIEMPRE ocurra.
--    auth.uid() sigue devolviendo el usuario de la petición (lee el JWT), o
--    NULL si la acción viene del SQL Editor / sistema.
--    Se excluye la columna `firma` (imagen base64) de los snapshots.
create or replace function public.fn_audit_log_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old jsonb;
  v_new jsonb;
  v_id  text;
begin
  if (tg_op = 'DELETE') then
    v_old := to_jsonb(old) - 'firma';
    v_new := null;
    v_id  := v_old->>'id';
  elsif (tg_op = 'UPDATE') then
    v_old := to_jsonb(old) - 'firma';
    v_new := to_jsonb(new) - 'firma';
    v_id  := coalesce(v_new->>'id', v_old->>'id');
  else -- INSERT
    v_old := null;
    v_new := to_jsonb(new) - 'firma';
    v_id  := v_new->>'id';
  end if;

  insert into public.audit_log
    (usuario_id, accion, tabla, registro_id, old_record, new_record)
  values
    (auth.uid(), tg_op, tg_table_name, v_id, v_old, v_new);

  return null; -- AFTER trigger: el valor de retorno se ignora
end;
$$;

-- 4) Asociar el trigger a las tablas críticas -------------------------------
--    Helper: se recrea idempotentemente en cada tabla.
drop trigger if exists trg_audit on public.transacciones_financieras;
create trigger trg_audit
  after insert or update or delete on public.transacciones_financieras
  for each row execute function public.fn_audit_log_trigger();

drop trigger if exists trg_audit on public.miembros_iglesia;
create trigger trg_audit
  after insert or update or delete on public.miembros_iglesia
  for each row execute function public.fn_audit_log_trigger();

drop trigger if exists trg_audit on public.perfiles;
create trigger trg_audit
  after insert or update or delete on public.perfiles
  for each row execute function public.fn_audit_log_trigger();

drop trigger if exists trg_audit on public.turnos_servidores;
create trigger trg_audit
  after insert or update or delete on public.turnos_servidores
  for each row execute function public.fn_audit_log_trigger();

-- ===================================================================
--  VERIFICACIÓN (opcional):
--   · Triggers instalados:
--       select tgrelid::regclass as tabla, tgname
--       from pg_trigger where tgname = 'trg_audit' order by 1;
--   · Prueba: inserta/edita una transacción y consulta:
--       select creado_at, accion, tabla, registro_id, usuario_id
--       from public.audit_log order by creado_at desc limit 10;
-- ===================================================================
