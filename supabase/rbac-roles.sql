-- ===================================================================
--  Centro Cristiano Mieles · RBAC (Roles y Permisos)
--  Tabla de perfiles + función mi_rol() + RLS por rol.
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
--
--  Roles: admin, pastor (total) · tesorero · lider · secretaria
-- ===================================================================

-- 1) Tabla de perfiles (1:1 con auth.users)
create table if not exists public.perfiles (
  id        uuid primary key references auth.users (id) on delete cascade,
  nombre    text,
  correo    text,
  rol       text not null default 'lider'
              check (rol in ('admin', 'pastor', 'tesorero', 'lider', 'secretaria')),
  activo    boolean not null default true,
  creado_at timestamptz not null default now()
);

-- 2) Función que devuelve el rol del usuario ACTUAL.
--    SECURITY DEFINER: corre como dueño de la tabla y evita recursión de RLS.
create or replace function public.mi_rol()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid() and activo = true;
$$;

grant execute on function public.mi_rol() to authenticated;

-- 3) Al crear un usuario en Auth, se genera su perfil con el rol mínimo.
create or replace function public.crear_perfil_nuevo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, correo, rol)
  values (new.id, new.email, 'lider')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo();

-- 4) RLS de perfiles: cada quien lee el suyo; admin/pastor gestionan todos.
alter table public.perfiles enable row level security;

drop policy if exists "perfiles_self_read" on public.perfiles;
create policy "perfiles_self_read" on public.perfiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "perfiles_admin_all" on public.perfiles;
create policy "perfiles_admin_all" on public.perfiles
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor'))
  with check (public.mi_rol() in ('admin', 'pastor'));

-- 5) Perfil para los usuarios que YA existen (rol mínimo por defecto).
insert into public.perfiles (id, correo, rol)
select id, email, 'lider' from auth.users
on conflict (id) do nothing;

-- 6) ⚠️ SEMBRADO DEL ADMINISTRADOR PRINCIPAL ⚠️
--    Reemplaza el correo por el del administrador y ejecuta. Sin esto,
--    quedarías como 'lider' y perderías acceso a Fichas y Tesorería.
insert into public.perfiles (id, nombre, correo, rol)
select id, coalesce(raw_user_meta_data->>'name', email), email, 'admin'
from auth.users
where email = 'REEMPLAZA_CON_TU_CORREO@ejemplo.com'
on conflict (id) do update set rol = 'admin', activo = true;

-- ===================================================================
--  7) RLS POR ROL en las tablas sensibles (reemplaza las anteriores)
-- ===================================================================

-- Fichas de miembros: admin, pastor, secretaría
drop policy if exists "miembros_admin" on public.miembros_iglesia;
drop policy if exists "miembros_rol" on public.miembros_iglesia;
create policy "miembros_rol" on public.miembros_iglesia
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'secretaria'))
  with check (public.mi_rol() in ('admin', 'pastor', 'secretaria'));

-- Tesorería: admin, pastor, tesorero
drop policy if exists "trx_fin_admin" on public.transacciones_financieras;
drop policy if exists "trx_fin_rol" on public.transacciones_financieras;
create policy "trx_fin_rol" on public.transacciones_financieras
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'tesorero'))
  with check (public.mi_rol() in ('admin', 'pastor', 'tesorero'));
