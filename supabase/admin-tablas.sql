-- ===================================================================
--  Centro Cristiano Mieles · Políticas RLS para las tablas EXISTENTES
--  (no crea tablas; ajusta los permisos para el panel y el sitio)
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
--
--  Tablas usadas por el panel:
--   · noticias  → avisos (tipo='aviso') y testimonios (tipo='testimonio')
--   · eventos   → actividades (nombre, fecha_evento, hora_inicio, ...)
--   · peticiones_oracion → formulario público de oración
-- ===================================================================

alter table public.noticias           enable row level security;
alter table public.eventos            enable row level security;
alter table public.peticiones_oracion enable row level security;

-- ------------------ NOTICIAS (avisos + testimonios) ------------------
-- Lectura pública (para mostrar avisos y testimonios en /comunidad).
drop policy if exists "noticias_lectura_publica" on public.noticias;
create policy "noticias_lectura_publica" on public.noticias
  for select using (true);

-- Crear / editar / eliminar solo el liderazgo autenticado.
drop policy if exists "noticias_admin" on public.noticias;
create policy "noticias_admin" on public.noticias
  for all to authenticated using (true) with check (true);

-- ------------------ EVENTOS ------------------
drop policy if exists "eventos_lectura_publica" on public.eventos;
create policy "eventos_lectura_publica" on public.eventos
  for select using (true);

drop policy if exists "eventos_admin" on public.eventos;
create policy "eventos_admin" on public.eventos
  for all to authenticated using (true) with check (true);

-- ------------------ PETICIONES DE ORACIÓN ------------------
-- Cualquiera puede ENVIAR una petición (formulario público anónimo)...
drop policy if exists "peticiones_insert_publico" on public.peticiones_oracion;
create policy "peticiones_insert_publico" on public.peticiones_oracion
  for insert with check (true);

-- ...pero SOLO el administrador autenticado puede leerlas / gestionarlas.
drop policy if exists "peticiones_admin_lectura" on public.peticiones_oracion;
create policy "peticiones_admin_lectura" on public.peticiones_oracion
  for select to authenticated using (true);

drop policy if exists "peticiones_admin_gestion" on public.peticiones_oracion;
create policy "peticiones_admin_gestion" on public.peticiones_oracion
  for update to authenticated using (true) with check (true);

-- ===================================================================
--  Recuerda crear el usuario administrador en:
--  Authentication → Users → Add user (correo + contraseña)
--  e ingresar al panel desde /login.
-- ===================================================================
