-- ===================================================================
--  Centro Cristiano Mieles · Analítica — setup COMPLETO e idempotente
--   1) Tablas page_views y page_events (+ índices + RLS)
--   2) RPC fn_get_impacto_stats afinado (America/Santiago, dispositivos,
--      fuentes por sesión con prioridad UTM)
--   3) Permisos (RPC gateado a admin/pastor)
--  Seguro de re-ejecutar. Copia y pega TODO en el SQL Editor de Supabase.
-- ===================================================================

-- ============ 1) TABLAS ============

-- Vistas de página
create table if not exists public.page_views (
  id           uuid primary key default gen_random_uuid(),
  path         text,
  session_id   text,
  referrer     text,
  device       text,
  country      text,
  city         text,
  duration_ms  int,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  creado_at    timestamptz not null default now()
);
-- Columnas que pudieran faltar si la tabla ya existía parcialmente.
alter table public.page_views
  add column if not exists device       text,
  add column if not exists country      text,
  add column if not exists city         text,
  add column if not exists duration_ms  int,
  add column if not exists utm_source   text,
  add column if not exists utm_medium   text,
  add column if not exists utm_campaign text;

create index if not exists page_views_creado_idx  on public.page_views (creado_at);
create index if not exists page_views_session_idx on public.page_views (session_id);

-- Eventos de interacción (clics, duración, share…)
create table if not exists public.page_events (
  id         uuid primary key default gen_random_uuid(),
  path       text,
  session_id text,
  referrer   text,
  device     text,
  country    text,
  city       text,
  name       text,
  meta       jsonb default '{}'::jsonb,
  creado_at  timestamptz not null default now()
);
alter table public.page_events
  add column if not exists device  text,
  add column if not exists country text,
  add column if not exists city    text,
  add column if not exists meta    jsonb;

create index if not exists page_events_creado_idx on public.page_events (creado_at);
create index if not exists page_events_name_idx   on public.page_events (name);

-- ============ 2) RLS ============
-- Inserción pública (el tracker /api/track usa la anon key; no guarda PII).
-- Lectura sólo para usuarios autenticados del panel.
alter table public.page_views  enable row level security;
alter table public.page_events enable row level security;

drop policy if exists "page_views_insert" on public.page_views;
create policy "page_views_insert" on public.page_views
  for insert with check (true);
drop policy if exists "page_views_select" on public.page_views;
create policy "page_views_select" on public.page_views
  for select to authenticated using (true);

drop policy if exists "page_events_insert" on public.page_events;
create policy "page_events_insert" on public.page_events
  for insert with check (true);
drop policy if exists "page_events_select" on public.page_events;
create policy "page_events_select" on public.page_events
  for select to authenticated using (true);

-- ============ 3) RPC afinado + permisos ============
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
  -- Sólo admin/pastor (los agregados incluyen motivos de peticiones).
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
  -- Una fuente por SESIÓN (fila de entrada), priorizando UTM sobre referrer.
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

grant execute on function public.fn_get_impacto_stats(int) to authenticated;
