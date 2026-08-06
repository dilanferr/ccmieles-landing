-- ===================================================================
--  Centro Cristiano Mieles · Endurecimiento de RLS (Fase 2 · H1 + H3)
--  Reemplaza las políticas permisivas `using(true)` por chequeos con
--  public.mi_rol(). Cierra el control de acceso roto (OWASP A01).
--
--  Patrón: se separan LECTURA y ESCRITURA en políticas distintas.
--  Como las políticas permisivas se combinan con OR, una política
--  `for select using(true)` mantiene la lectura pública mientras que
--  una política `for all` restringida gobierna INSERT/UPDATE/DELETE.
--
--  Requiere que public.mi_rol() ya exista (supabase/rbac-roles.sql).
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

-- ------------------------------------------------------------------
-- NOTICIAS · lectura pública · escritura admin/pastor
-- ------------------------------------------------------------------
alter table public.noticias enable row level security;
drop policy if exists "noticias_lectura_publica" on public.noticias;
drop policy if exists "noticias_admin" on public.noticias;

create policy "noticias_select_publico" on public.noticias
  for select using (true);

create policy "noticias_escritura_rol" on public.noticias
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor'))
  with check (public.mi_rol() in ('admin', 'pastor'));

-- ------------------------------------------------------------------
-- EVENTOS · lectura pública · escritura admin/pastor
-- ------------------------------------------------------------------
alter table public.eventos enable row level security;
drop policy if exists "eventos_lectura_publica" on public.eventos;
drop policy if exists "eventos_admin" on public.eventos;

create policy "eventos_select_publico" on public.eventos
  for select using (true);

create policy "eventos_escritura_rol" on public.eventos
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor'))
  with check (public.mi_rol() in ('admin', 'pastor'));

-- ------------------------------------------------------------------
-- CLASIFICADOS · lectura pública · escritura admin/pastor
-- ------------------------------------------------------------------
alter table public.clasificados enable row level security;
drop policy if exists "clasificados_lectura_publica" on public.clasificados;
drop policy if exists "clasificados_admin" on public.clasificados;

create policy "clasificados_select_publico" on public.clasificados
  for select using (true);

create policy "clasificados_escritura_rol" on public.clasificados
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor'))
  with check (public.mi_rol() in ('admin', 'pastor'));

-- ------------------------------------------------------------------
-- SERVICIOS_SEMANALES · lectura pública · escritura liderazgo operativo
--   Nota: la columna `encargado` queda visible públicamente. Si es
--   información interna, cambia esta lectura a `to authenticated`.
-- ------------------------------------------------------------------
alter table public.servicios_semanales enable row level security;
drop policy if exists "servicios_admin" on public.servicios_semanales;

create policy "servicios_select_publico" on public.servicios_semanales
  for select using (true);

create policy "servicios_escritura_rol" on public.servicios_semanales
  for all to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'))
  with check (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'));

-- ------------------------------------------------------------------
-- PETICIONES_ORACION · INSERT público (formulario) · lectura/gestión
--   restringida a admin/pastor/intercesion. El saneado (longitudes,
--   campos permitidos) lo hace la app en el formulario público.
-- ------------------------------------------------------------------
alter table public.peticiones_oracion enable row level security;
drop policy if exists "peticiones_insert_publico" on public.peticiones_oracion;
drop policy if exists "peticiones_admin_lectura" on public.peticiones_oracion;
drop policy if exists "peticiones_admin_gestion" on public.peticiones_oracion;

-- Cualquiera (anon) puede ENVIAR una petición desde el formulario público.
create policy "peticiones_insert_publico" on public.peticiones_oracion
  for insert with check (true);

-- SOLO admin/pastor/intercesion pueden LEER las peticiones.
create policy "peticiones_lectura_rol" on public.peticiones_oracion
  for select to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'intercesion'));

-- SOLO admin/pastor/intercesion pueden gestionarlas (marcar leído, etc.).
create policy "peticiones_update_rol" on public.peticiones_oracion
  for update to authenticated
  using (public.mi_rol() in ('admin', 'pastor', 'intercesion'))
  with check (public.mi_rol() in ('admin', 'pastor', 'intercesion'));

-- ===================================================================
--  VERIFICACIÓN (opcional): lista las políticas resultantes.
--    select tablename, policyname, cmd, roles
--    from pg_policies
--    where schemaname = 'public'
--      and tablename in ('noticias','eventos','clasificados',
--                        'servicios_semanales','peticiones_oracion')
--    order by tablename, cmd;
-- ===================================================================
