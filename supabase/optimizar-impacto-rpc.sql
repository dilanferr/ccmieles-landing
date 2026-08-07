-- ===================================================================
--  Centro Cristiano Mieles · Optimización de /api/impacto (M7)
--
--  Mueve TODA la agregación de page_views/page_events/peticiones a la BD.
--  Antes el route traía hasta 20.000 filas a memoria y agregaba en JS;
--  ahora la BD devuelve un único jsonb con los conteos ya calculados.
--
--  SECURITY DEFINER: corre como dueño (agrega aunque page_views tenga RLS)
--  pero incluye un guard de rol (solo admin/pastor) como defensa en
--  profundidad, porque el resultado incluye agregados de peticiones.
--
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

create or replace function public.fn_get_impacto_stats(dias int)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_desde      timestamptz := now() - make_interval(days => dias);
  v_desde_prev timestamptz := now() - make_interval(days => dias * 2);
  v_result     jsonb;
begin
  -- Solo admin/pastor (los agregados incluyen motivos de peticiones).
  if public.mi_rol() not in ('admin', 'pastor') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  with
  pv as (
    select path, session_id, referrer, city, creado_at
    from public.page_views
    where creado_at >= v_desde
  ),
  pe as (
    select name, meta
    from public.page_events
    where creado_at >= v_desde
  ),
  paginas as (
    select coalesce(
      jsonb_agg(jsonb_build_object('path', path, 'n', n) order by n desc),
      '[]'::jsonb) arr
    from (select path, count(*) n from pv group by path) t
  ),
  fuentes as (
    select coalesce(
      jsonb_agg(jsonb_build_object('fuente', fuente, 'n', n)),
      '[]'::jsonb) arr
    from (
      select
        case
          when referrer is null or referrer = '' then 'Directo'
          when referrer ilike '%google%' then 'Google'
          when referrer ilike '%facebook%' or referrer ilike '%fb.%' then 'Facebook'
          when referrer ilike '%instagram%' then 'Instagram'
          when referrer ilike '%whatsapp%' or referrer ilike '%wa.me%' then 'WhatsApp'
          when referrer ilike '%youtube%' or referrer ilike '%youtu.be%' then 'YouTube'
          when referrer ilike '%bing%' then 'Bing'
          when referrer ilike '%t.co%' or referrer ilike '%twitter%'
               or referrer ilike '%x.com%' then 'X'
          else coalesce(
            nullif(regexp_replace(
              substring(referrer from '^https?://([^/]+)'), '^www\.', ''), ''),
            'Directo')
        end fuente,
        count(*) n
      from pv
      group by 1
    ) t
  ),
  ciudades as (
    select coalesce(
      jsonb_agg(jsonb_build_object('ciudad', city, 'n', n) order by n desc),
      '[]'::jsonb) arr
    from (
      select city, count(*) n from pv
      where city is not null and city <> '' group by city
    ) t
  ),
  serie as (
    select coalesce(
      jsonb_agg(jsonb_build_object('key', d, 'n', n)),
      '[]'::jsonb) arr
    from (
      select to_char(creado_at at time zone 'UTC', 'YYYY-MM-DD') d, count(*) n
      from pv group by 1
    ) t
  ),
  motivos as (
    select coalesce(
      jsonb_agg(jsonb_build_object('motivo', motivo, 'n', n) order by n desc),
      '[]'::jsonb) arr
    from (
      select coalesce(nullif(motivo, ''), 'Otros') motivo, count(*) n
      from public.peticiones_oracion group by 1
    ) t
  ),
  dur as (
    select avg(ms) avg_ms
    from (
      select (meta->>'ms')::numeric ms
      from pe
      where name = 'duration' and (meta->>'ms') ~ '^[0-9]+(\.[0-9]+)?$'
    ) x
    where ms > 0 and ms < 1800000
  )
  select jsonb_build_object(
    'visitas', (select count(*) from pv),
    'alcanzadas', (select count(distinct session_id) from pv where session_id is not null),
    'tiempo_promedio_ms', coalesce((select avg_ms from dur), 0),
    'planificaron', (select count(*) from pe where name = 'visit_plan_click'),
    'testimonio_plays', (select count(*) from pe where name = 'testimonio_play'),
    'shares', (select count(*) from pe where name = 'share'),
    'prev_visitas', (
      select count(*) from public.page_views
      where creado_at >= v_desde_prev and creado_at < v_desde
    ),
    'peticiones_total', (select count(*) from public.peticiones_oracion),
    'peticiones_pendientes', (select count(*) from public.peticiones_oracion where leido = false),
    'paginas', (select arr from paginas),
    'fuentes', (select arr from fuentes),
    'ciudades', (select arr from ciudades),
    'serie', (select arr from serie),
    'motivos', (select arr from motivos)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.fn_get_impacto_stats(int) to authenticated;

-- Índice recomendado para que las agregaciones por ventana sean rápidas.
create index if not exists page_views_creado_idx on public.page_views (creado_at);
create index if not exists page_events_creado_idx on public.page_events (creado_at);

-- ===================================================================
--  VERIFICACIÓN (opcional):  select public.fn_get_impacto_stats(30);
-- ===================================================================
