-- ===================================================================
--  Centro Cristiano Mieles · Atribución por sesión + UTM (A1 + A5)
--   · Columnas utm_source/medium/campaign en page_views.
--   · fn_get_impacto_stats: fuentes contadas por SESIÓN (fila de entrada),
--     priorizando UTM sobre referrer.
--  ⚠️ Ejecuta ESTE SQL ANTES de desplegar el código (si no, /api/track
--     insertaría en columnas inexistentes y perdería vistas).
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

-- 1) Columnas UTM para atribuir campañas (WhatsApp/Facebook/Instagram…).
alter table public.page_views
  add column if not exists utm_source   text,
  add column if not exists utm_medium   text,
  add column if not exists utm_campaign text;

-- 2) RPC afinado: fuentes por sesión con prioridad UTM.
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
    select path, session_id, referrer, city, device, country, utm_source, creado_at
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
  -- Una fuente por SESIÓN: se toma la fila de ENTRADA (menor creado_at) de
  -- cada session_id; el cliente sólo envía referrer/UTM en la 1ª vista. Se
  -- prioriza UTM sobre referrer y el propio dominio ya viene excluido.
  fuentes as (
    select coalesce(
      jsonb_agg(jsonb_build_object('fuente', fuente, 'n', n)),
      '[]'::jsonb) arr
    from (
      select fuente, count(*) n
      from (
        select distinct on (session_id)
          session_id,
          case
            when utm_source ilike 'whatsapp' then 'WhatsApp'
            when utm_source ilike 'facebook' or utm_source ilike 'fb' then 'Facebook'
            when utm_source ilike 'instagram' or utm_source ilike 'ig' then 'Instagram'
            when utm_source is not null and utm_source <> '' then initcap(utm_source)
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
          end fuente
        from pv
        where session_id is not null
        order by session_id, creado_at asc
      ) entrada
      group by fuente
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
