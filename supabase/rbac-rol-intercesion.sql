-- ===================================================================
--  Centro Cristiano Mieles · Agregar rol 'intercesion' al RBAC
--  Acceso: solo Peticiones de Oración + Dashboard.
--  Copia y pega en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles
  add constraint perfiles_rol_check
  check (rol in ('admin', 'pastor', 'tesorero', 'lider', 'secretaria', 'intercesion'));
