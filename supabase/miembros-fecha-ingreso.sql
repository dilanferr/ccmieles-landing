-- ===================================================================
--  Centro Cristiano Mieles · Fichas · Fecha de ingreso a la iglesia
--  Agrega la columna fecha_ingreso a miembros_iglesia.
--  ⚠️ Ejecuta ANTES (o apenas) se despliegue el código: sin la columna,
--     la creación/edición de fichas fallaría al insertar fecha_ingreso.
--  Seguro de re-ejecutar. Copia y pega en el SQL Editor de Supabase.
-- ===================================================================

alter table public.miembros_iglesia
  add column if not exists fecha_ingreso date;
