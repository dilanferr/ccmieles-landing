-- ===================================================================
--  Centro Cristiano Mieles · Consolidación (Fase 2C)
--  Directorio SEGURO de servidores del panel para el dropdown de
--  "responsable" de una consolidación.
--
--  Por qué: la RLS de `perfiles` es self-read (cada quien ve el suyo) +
--  admin/pastor gestionan todos. Un `lider`/`secretaria` NO puede listar
--  perfiles para asignar responsable. Esta función SECURITY DEFINER expone
--  SOLO id + nombre + correo + rol de los usuarios ACTIVOS del panel, y solo
--  al equipo de consolidación (admin/pastor/lider/secretaria).
--
--  Requiere: public.mi_rol(), public.perfiles.
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

create or replace function public.fn_servidores()
returns table (id uuid, nombre text, correo text, rol text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, coalesce(nullif(btrim(p.nombre), ''), p.correo) as nombre,
         p.correo, p.rol
  from public.perfiles p
  where p.activo = true
    and public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria')
  order by coalesce(nullif(btrim(p.nombre), ''), p.correo);
$$;

grant execute on function public.fn_servidores() to authenticated;

-- ===================================================================
--  VERIFICACIÓN (opcional):  select * from public.fn_servidores();
-- ===================================================================
