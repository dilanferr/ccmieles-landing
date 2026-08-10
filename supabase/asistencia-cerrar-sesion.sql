-- ===================================================================
--  Centro Cristiano Mieles · Asistencia · columna de cierre de sesión
--  Permite marcar un culto/evento como finalizado (cerrada_at) sin
--  eliminarlo. NULL = sesión abierta (admite check-in); con fecha = cerrada.
--  Ejecutar en el SQL Editor de Supabase.
-- ===================================================================

alter table public.eventos_cultos
  add column if not exists cerrada_at timestamptz;
