-- ===================================================================
--  Centro Cristiano Mieles · Tabla TRANSACCIONES_FINANCIERAS (Tesorería)
--  Control de ingresos y egresos de la iglesia. Uso interno del panel.
--  Copia y pega TODO en el SQL Editor de Supabase y ejecútalo.
-- ===================================================================

create table if not exists public.transacciones_financieras (
  id               uuid primary key default gen_random_uuid(),
  tipo             text not null check (tipo in ('ingreso', 'egreso')),
  monto            numeric(14,2) not null default 0 check (monto >= 0),
  categoria        text not null,
  descripcion      text,
  metodo_pago      text,   -- Efectivo, Transferencia, Tarjeta, Otro
  fecha            date not null default current_date,
  comprobante_url  text,   -- boleta/factura adjunta (opcional)
  creado_por       uuid references auth.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Índices para los filtros (fecha, tipo, categoría).
create index if not exists trx_fin_fecha_idx on public.transacciones_financieras (fecha desc);
create index if not exists trx_fin_tipo_idx  on public.transacciones_financieras (tipo);
create index if not exists trx_fin_cat_idx   on public.transacciones_financieras (categoria);

-- ------------------ Row Level Security (ESTRICTA) ------------------
-- Datos financieros sensibles: SOLO el liderazgo autenticado accede.
alter table public.transacciones_financieras enable row level security;

drop policy if exists "trx_fin_admin" on public.transacciones_financieras;
create policy "trx_fin_admin" on public.transacciones_financieras
  for all to authenticated using (true) with check (true);
