# Resumen Ejecutivo — Auditoría Técnica y Remediación

**Proyecto:** Centro Cristiano Mieles · Plataforma web + Panel administrativo
**Stack:** Next.js 16.3.0 (App Router) · React 19 · Supabase (PostgreSQL + RLS) · Tailwind v4 · TypeScript
**Alcance:** Auditoría técnica integral (Fase 1, solo lectura) + Remediación controlada (Fase 2)
**Rama:** `main` · **Resultado:** 3/3 Altos y 8/8 Medios cerrados; deuda técnica menor saneada.

---

## 1. Contexto

Tras varias iteraciones de construcción de módulos (RBAC, Turnos, Tesorería, Fichas, Auditoría), se ejecutó una **auditoría técnica integral** (ver [FULL-AUDIT-REPORT.md](FULL-AUDIT-REPORT.md)) que detectó **16 hallazgos** clasificados por severidad. Esta fase de remediación los resolvió uno por uno, cada corrección verificada con `eslint` + `tsc` + `next build` (+ tests desde M5) y desplegada a producción de forma incremental.

**Sin incidentes críticos:** no se detectó RCE, fuga masiva de datos ni compromiso de sistema. El riesgo principal era **control de acceso incompleto** (OWASP A01), hoy cerrado.

---

## 2. Hallazgos resueltos

### 🟠 Altos (3/3)

| ID | Hallazgo | Solución |
|----|----------|----------|
| **H1** | RLS `using(true)` permitía a cualquier rol escribir en tablas de contenido | Políticas RLS reescritas con `public.mi_rol()` por tabla (noticias/eventos/clasificados → admin/pastor; servicios → liderazgo operativo; peticiones → lectura admin/pastor/intercesión). `supabase/security-hardening-rls.sql` |
| **H2** | Usuario desactivado conservaba acceso al panel | Kill-switch en `middleware.ts` y `admin/page.tsx`: `activo=false` → `/login?error=cuenta_desactivada` (con mensaje en login) |
| **H3** | Peticiones de oración legibles por todo autenticado | Lectura/gestión restringida a `admin/pastor/intercesion` vía RLS |

### 🟡 Medios (8/8)

| ID | Hallazgo | Solución |
|----|----------|----------|
| **M1** | 5 vulnerabilidades `high` (postcss, sharp) | Actualización de Next.js 16.2.7 → **16.3.0**; `npm audit` = **0 vulnerabilidades** |
| **M2** | Formulario público de peticiones sin anti-spam | Endpoint `/api/peticion` con **honeypot + timing + rate-limit** best-effort + saneado server-side |
| **M3** | `/api/cloudinary` sin gating por rol | Subida restringida a admin/pastor/tesorero; listado a admin/pastor (vía `mi_rol()`) |
| **M4** | Comprobantes financieros con URL pública | Subida como recurso **privado** (`type=authenticated`) + proxy gateado `/api/comprobante` con URL firmada de 60 s y stream; el navegador nunca ve la URL de Cloudinary |
| **M5** | Sin tests / 0% cobertura | **Vitest** (12 tests de Server Actions) + **Playwright** (E2E de kill-switch y gating) + **CI GitHub Actions** (lint → typecheck → unit) |
| **M6** | Sin cabeceras de seguridad HTTP | `next.config.ts`: HSTS, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| **M7** | `/api/impacto` traía hasta 20k filas a memoria | Agregación movida a la BD vía RPC `fn_get_impacto_stats(dias)`; payload idéntico; gateado a admin/pastor |
| **M8** | Auditoría a nivel app, evitable | **Auditoría inalterable por triggers** de PostgreSQL (`SECURITY DEFINER`) sobre finanzas, fichas, perfiles y turnos; captura old/new record |

### 🔵 Bajos

| ID | Hallazgo | Estado |
|----|----------|--------|
| **L1** | `set-state-in-effect` (8 casos) | ✅ Refactorizado (IIFE async / reinicio en render); regla **reactivada como `error`** |
| **L2** | Imports/variables sin uso | ✅ Limpiados |
| **L4** | Duplicación de exportación a PDF | ✅ Utilidad compartida `src/utils/exportPdf.ts` (−143 líneas netas en módulos) |
| **L3** | Componentes >600 líneas | ⬜ Diferido (regla del Boy Scout: refactor progresivo al evolucionar cada módulo) |
| **L5** | `peticiones_oracion` sin política DELETE | ⬜ Aceptado (tabla append-only; el spam se mitiga en M2) |

---

## 3. Decisiones y patrones de arquitectura establecidos

- **RBAC en dos capas:** UI (gating de `AdminShell`) + **RLS como barrera real**. La función `public.mi_rol()` (`SECURITY DEFINER`, respeta `activo`) es la fuente de verdad del rol.
- **Auditoría por triggers de BD**, no por aplicación → inalterable, captura cualquier escritura (incluidas las directas por REST).
- **Documentos financieros privados** mediante proxy gateado con URL firmada de corta duración (sin depender de add-ons de pago de Cloudinary).
- **Agregación pesada en la BD** (RPC) en vez de en memoria en el route.
- **Anti-spam sin CAPTCHA** (honeypot + timing) para no castigar la UX.
- **Red de regresión:** Vitest para Server Actions (Supabase mockeado), Playwright para flujos de seguridad, CI en cada push/PR.
- **Efectos idiomáticos:** IIFE async con guard `vivo` (setState tras `await`) y reinicio de estado en render.

---

## 4. Métricas de resultado

| Indicador | Antes | Después |
|-----------|-------|---------|
| Vulnerabilidades de dependencias | 5 `high` | **0** |
| Cobertura de tests | 0% (sin runner) | Vitest (12) + Playwright (E2E) + CI |
| Hallazgos Altos abiertos | 3 | **0** |
| Hallazgos Medios abiertos | 8 | **0** |
| Regla `set-state-in-effect` | warning | **error** |
| Duplicación de export PDF | 4 copias | 1 utilidad compartida |
| Cabeceras de seguridad HTTP | 0 | 5 |

---

## 5. Migraciones SQL introducidas (ejecutadas en Supabase)

- `supabase/auditoria-soft-delete.sql` — tabla `audit_log` + soft-delete (`eliminado_at`) + `directorio_miembros()`.
- `supabase/security-hardening-rls.sql` — RLS por rol (H1/H3).
- `supabase/audit-triggers.sql` — `fn_audit_log_trigger()` + triggers (M8).
- `supabase/optimizar-impacto-rpc.sql` — `fn_get_impacto_stats()` + índices (M7).

*(Groundwork previo: `rbac-roles.sql`, `rbac-rol-intercesion.sql`, `turnos-servidores.sql`, tablas de dominio.)*

---

## 6. Estado final

**16 hallazgos → 14 resueltos, 2 diferidos/aceptados (L3, L5), 0 críticos.**
La plataforma cuenta hoy con: seguridad perimetral (RLS por rol, kill-switch, headers), auditoría forense inalterable, protección de documentos sensibles, anti-abuso en endpoints públicos, dependencias sin vulnerabilidades, rendimiento optimizado y una red de tests con CI/CD.

### Deuda técnica remanente (no bloqueante)
- **L3** — Descomponer módulos >600 líneas (`FinanzasModule`, `TurnosModule`, `DashboardModule`, `MiembrosModule`) en subcomponentes. Abordar progresivamente.
- **Mejora futura opcional** — Rate-limit distribuido (Upstash) si aparece spam directo por la API REST; migrar comprobantes públicos antiguos a privados.

---

*Documento de cierre de la fase de auditoría y remediación. Próxima fase: diseño del Módulo de Inventario y Bienes.*
