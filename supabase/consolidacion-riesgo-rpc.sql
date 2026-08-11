-- ===================================================================
--  Centro Cristiano Mieles · Consolidación (Fase 3)
--  Conteo LIVIANO de casos "en riesgo / estancado" para el badge del
--  sidebar. Devuelve un solo entero (no filas), calculado en la BD.
--
--  En riesgo = sigue en 'recibido' o 'contactado' y lleva MÁS de 7 días
--  sin actividad, donde actividad = la fecha más reciente entre la última
--  nota, la creación y la recepción.
--
--  Requiere: public.mi_rol(), public.consolidacion, public.consolidacion_notas.
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

create or replace function public.fn_consolidacion_riesgo()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.consolidacion c
  where c.eliminado_at is null
    and c.estado in ('recibido', 'contactado')
    and public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria')
    and greatest(
          coalesce(
            (select max(n.creado_at)
               from public.consolidacion_notas n
              where n.consolidacion_id = c.id),
            c.creado_at
          ),
          c.creado_at,
          c.fecha_recepcion::timestamptz
        ) < (now() - interval '7 days');
$$;

grant execute on function public.fn_consolidacion_riesgo() to authenticated;

-- ===================================================================
--  VERIFICACIÓN (opcional):  select public.fn_consolidacion_riesgo();
-- ===================================================================
