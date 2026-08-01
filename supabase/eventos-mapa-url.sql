-- ===================================================================
--  Centro Cristiano Mieles · Eventos → columna mapa_url
--  Enlace opcional de Google Maps por evento (botón "Cómo llegar").
--  Copia y pega en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

alter table public.eventos
  add column if not exists mapa_url text;
