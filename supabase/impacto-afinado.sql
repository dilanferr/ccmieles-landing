-- ===================================================================
--  Centro Cristiano Mieles · Afinado de analítica de Impacto
--  Actualiza fn_get_impacto_stats:
--   · A6: serie diaria agrupada en zona horaria America/Santiago (no UTC).
--   · A7: agrega el desglose por dispositivo (móvil/escritorio).
--  Reemplaza la función existente (create or replace). Copia y pega en el
--  SQL Editor de Supabase y ejecútalo.
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
  if public.mi_rol() not in ('admin', 'pastor') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  with
  pv as (
    select path, session_id, referrer, city, device, country, creado_at
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
  dispositivos as (
    select coalesce(
      jsonb_agg(jsonb_build_object('device', device, 'n', n) order by n desc),
      '[]'::jsonb) arr
    from (
      select coalesce(nullif(device, ''), 'otro') device, count(*) n
      from pv group by 1
    ) t
  ),
  serie as (
    select coalesce(
      jsonb_agg(jsonb_build_object('key', d, 'n', n)),
      '[]'::jsonb) arr
    from (
      select to_char(creado_at at time zone 'America/Santiago', 'YYYY-MM-DD') d,
             count(*) n
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
    'dispositivos', (select arr from dispositivos),
    'serie', (select arr from serie),
    'motivos', (select arr from motivos)
  ) into v_result;

  return v_result;
end;
$$;
