-- ===================================================================
--  Centro Cristiano Mieles · Fichas · Fecha de bautismo
--  Agrega la columna fecha_bautismo a miembros_iglesia (para el módulo
--  de Cuidado Pastoral: aniversarios de bautismo).
--  ⚠️ Ejecuta ANTES (o apenas) se despliegue el código: sin la columna,
--     la creación/edición de fichas fallaría al insertar fecha_bautismo.
--  Seguro de re-ejecutar. Copia y pega en el SQL Editor de Supabase.
-- ===================================================================

alter table public.miembros_iglesia
  add column if not exists fecha_bautismo date;
