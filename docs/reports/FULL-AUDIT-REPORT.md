# AUDITORÍA INTEGRAL DEL PROYECTO — Centro Cristiano Mieles

> **Fase 1 — Solo lectura.** No se modificó código, configuración, base de datos ni Git.
> Fecha: 2026-08-06 · Rama: `main` · Último commit: `43fbc1c`
> Metodología: análisis estático + ejecución de herramientas + revisión manual de código y RLS.

## Tabla ejecutiva

| Área          | Estado | Problemas |
| ------------- | :----: | --------: |
| Build         | 🟢 |  0 |
| Tests         | 🟠 |  1 |
| Seguridad     | 🟠 |  7 |
| Dependencias  | 🟡 |  1 |
| Base de datos | 🟠 |  2 |
| API           | 🟠 |  3 |
| Frontend      | 🟡 |  4 |
| Backend       | 🟡 |  2 |
| Performance   | 🟡 |  1 |
| Arquitectura  | 🟡 |  2 |

**Leyenda de confianza:** `CONFIRMADO` = verificado con comando/código · `PARCIALMENTE CONFIRMADO` = confirmado en el código/SQL del repo pero no contra la BD en vivo · `NO VERIFICABLE` = requiere credenciales/entorno no disponibles.

---

## 1. Resumen ejecutivo

El proyecto es una **plataforma web + panel administrativo** para una iglesia (Next.js 16 App Router + Supabase). La base técnica es **sólida**: compila sin errores, no hay secretos versionados, la autenticación usa el patrón correcto (`getUser()` con validación de JWT en middleware), y las **dos tablas más sensibles (finanzas y fichas médicas) SÍ están correctamente protegidas por RLS basada en rol** (`mi_rol()`).

Sin embargo, la auditoría detecta un **patrón sistémico de control de acceso incompleto**: varias tablas usan políticas RLS `for all to authenticated using(true)`, lo que permite que **cualquier usuario autenticado —sin importar su rol, e incluso un usuario desactivado con sesión vigente— lea o modifique esas tablas directamente por la API REST pública**, saltándose el RBAC de la interfaz. Esto afecta a `noticias`, `eventos`, `clasificados`, `servicios_semanales` y `peticiones_oracion`.

Además: **no existe suite de tests** (0% cobertura) para un sistema que maneja datos financieros y médicos, hay **5 vulnerabilidades `high` en dependencias transitivas** de `next`, **no hay rate limiting** en los endpoints públicos, y **faltan cabeceras de seguridad HTTP**.

**No se detectaron vulnerabilidades CRÍTICAS confirmadas** (sin RCE, sin fuga masiva de datos financieros/médicos). El riesgo principal es de **integridad y privacidad de contenido interno** por control de acceso incompleto (OWASP A01: Broken Access Control).

---

## 2. Stack detectado — `CONFIRMADO`

| Capa | Tecnología |
|---|---|
| Lenguaje | TypeScript ^5 |
| Framework | Next.js **16.2.7** (App Router) |
| UI | React 19.2.4, Tailwind CSS v4, framer-motion/motion |
| Backend | Server Actions + Route Handlers (Next.js) |
| BaaS / BD | **Supabase** (PostgreSQL + Auth + RLS) vía `@supabase/ssr` y `@supabase/supabase-js` |
| Media | Cloudinary (`next-cloudinary` + Admin API firmada) |
| Auth | Supabase Auth (cookies SSR) + middleware |
| Autorización | RBAC propio: `perfiles` + `mi_rol()` + RLS + gating de UI |
| Gestor de paquetes | npm (`package-lock.json`) |
| Build | `next build` |
| Lint | ESLint 9 + `eslint-config-next` |
| Tests | **Ninguno** (sin jest/vitest/playwright/cypress) |
| CI/CD | No detectado en el repo (deploy asumido en Vercel) |
| Docker | No |

**Métricas:** 116 archivos `.ts/.tsx` en `app/` + `src/` · 23.251 líneas · 3 API routes · 10 scripts SQL · 32 componentes de admin.

---

## 3. Arquitectura detectada — `CONFIRMADO`

```text
Proyecto (Next.js App Router)
│
├── app/(publica)/        Sitio público (SSG/SSR) — home, ministerios, eventos, oración
├── app/(admin)/admin/    Panel (client) — AdminShell con tabs + 32 módulos
│   └── _components/       Módulos + Server Actions (finanzas, miembros, turnos, usuarios…)
├── app/api/              3 Route Handlers: cloudinary, impacto, track
├── src/utils/            Clientes Supabase (server / public) + middleware
├── supabase/*.sql        10 scripts de esquema + RLS (ejecución manual en Supabase)
└── middleware.ts         Protección de /admin + refresco de sesión
```

- **Autorización en dos capas**: (1) UI — `AdminShell` filtra tabs por `mi_rol`; (2) BD — RLS. **La capa (2) es la única real** porque la anon key es pública. El hallazgo H1 documenta dónde la capa (2) falta.
- **Modelo de datos separado** por dominio (buena práctica). Componentes muy grandes (ver L3).
- **Sin service_role key** en ninguna parte (positivo, `CONFIRMADO`).

---

## 4. Herramientas ejecutadas

| Herramienta | Comando | Resultado |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | 🟢 `CONFIRMADO` — 0 errores |
| ESLint | `npx eslint .` | 🔵 8 errores + 2 warnings (`CONFIRMADO`) |
| Build | `npx next build` | 🟢 `CONFIRMADO` — compila OK |
| npm audit | `npm audit` | 🟡 5 vulnerabilidades `high` (`CONFIRMADO`) |
| Tests | — | ⚪ No hay runner ni scripts (`CONFIRMADO`) |
| git | `git status/log` | 🟢 Árbol limpio, historia coherente |
| Secret scan | `git grep` de patrones | 🟢 Sin secretos versionados |

Herramientas de seguridad especializadas (Snyk, Trivy, SonarQube, gitleaks) **no disponibles**: no se ejecutaron porque no están instaladas.

---

## 5. Resultado de tests — `CONFIRMADO`

```text
Tests totales:   NO DISPONIBLE (no existe suite de tests)
Exitosos:        —
Fallidos:        —
Omitidos:        —
Cobertura:       NO DISPONIBLE (0%)
```

No hay `jest`, `vitest`, `playwright`, `cypress` ni script `test` en `package.json`. **Cero cobertura** sobre lógica financiera, médica, RBAC y Server Actions. → Ver **M5**.

---

## 6. Resultado de build — `CONFIRMADO`

`next build` compila correctamente (verificado múltiples veces en esta sesión). Sin errores de producción. Prerender SSG de páginas públicas OK. `tsc --noEmit` limpio. **Build = 🟢.**

---

## 7. Resultado de análisis estático — `CONFIRMADO`

**ESLint: 8 errores + 2 warnings.**

| Regla | Nº | Archivos |
|---|---|---|
| `react-hooks/set-state-in-effect` | 8 | `AdminShell.tsx:142`, `Navbar.tsx:22`, `PeticionesModule.tsx:70` (y otros efectos con `setState` sincrónico / patrón `cargar()`) |
| `@typescript-eslint/no-unused-vars` | 2 | `grupos/evangelizacion/page.tsx:9` (`UsersIcon`), `StoryTimeline.tsx:21` (`i`) |

- Los 8 errores son de **calidad/rendimiento de render** (cascadas de render), **no** bloquean el build de producción (Next no ejecuta ESLint como gate). Patrón preexistente y repetido. → **L1**.
- `tsc` sin errores: tipado estricto correcto en todo el árbol.

---

## 8. Seguridad

### 🟠 H1 — Broken Access Control: RLS `using(true)` en tablas de contenido — `PARCIALMENTE CONFIRMADO`
**Archivos:** `supabase/admin-tablas.sql:24,44,48`, `supabase/servicios-semanales.sql:29`, `supabase/clasificados.sql:25`
Las políticas `for all to authenticated using(true) with check(true)` conceden a **cualquier usuario autenticado (cualquier rol)** permiso de INSERT/UPDATE/DELETE sobre `noticias`, `eventos`, `clasificados`, `servicios_semanales`, y SELECT/UPDATE sobre `peticiones_oracion`. Como la **anon key es pública** y el endpoint REST de Supabase es accesible con cualquier sesión válida, un usuario de bajo privilegio (p. ej. `intercesion`, `lider`) puede **saltarse el RBAC de la UI** y modificar estas tablas directamente.
**Impacto:** desfiguración del sitio público (noticias/testimonios/eventos/clasificados se muestran públicamente), borrado de eventos, y lectura de todas las peticiones de oración. **Estas escrituras directas NO quedan en `audit_log`** (ver M8).
**Evidencia:** contraste con `miembros_iglesia`/`transacciones_financieras`, que SÍ usan `mi_rol()` (rbac-roles.sql §7). El resto quedó con la política permisiva original.
**Recomendación:** reemplazar `using(true)` por `using(public.mi_rol() in (...roles...))` por tabla, según quién deba escribir (p. ej. `servicios_semanales` → `admin/pastor/lider/secretaria`; `noticias/eventos/clasificados` → `admin/pastor` o el rol de contenido que definas). Mantener `select using(true)` solo donde la lectura deba ser pública.

### 🟠 H2 — Usuario desactivado no pierde el acceso al panel — `CONFIRMADO` (código)
**Archivos:** `middleware.ts:32-42`, `app/(admin)/admin/page.tsx:13-21`
El middleware solo comprueba **autenticación** (`getUser()`), no el flag `activo`. `page.tsx` asigna rol por defecto **`lider`** cuando el perfil está inactivo (`if (perfil?.activo && perfil.rol)` → si `activo=false`, queda en `lider`) en lugar de **denegar el acceso**. `mi_rol()` sí filtra por `activo=true`, por lo que las tablas gated (finanzas/fichas/turnos) quedan bloqueadas — **pero** las tablas de H1 (`using(true)`) **no** consultan `mi_rol()`, así que un usuario desactivado con sesión/refresh token vigente **conserva acceso de escritura** a noticias/eventos/clasificados/servicios/peticiones.
**Impacto:** "Desactivar usuario" (UsuariosModule) **no es un kill-switch real**; el ex-colaborador retiene acceso parcial hasta que expire/revoque su refresh token.
**Recomendación:** en `middleware.ts` (o en el layout del admin) consultar `perfiles.activo` y redirigir a `/login` si es `false`; además corregir H1 para que todo dependa de `mi_rol()`. Considerar revocar sesiones al desactivar.

### 🟠 H3 — Privacidad de peticiones de oración — `PARCIALMENTE CONFIRMADO`
**Archivo:** `supabase/admin-tablas.sql:44-45`
`peticiones_admin_lectura` = `for select to authenticated using(true)`: **todo** usuario autenticado puede leer **todas** las peticiones, que pueden contener datos personales/de salud/crisis. Debería limitarse a `admin/pastor/intercesion`.
**Recomendación:** `using(public.mi_rol() in ('admin','pastor','intercesion'))`.

### 🟡 M2 — Endpoints públicos sin rate limiting — `CONFIRMADO`
**Archivos:** `app/api/track/route.ts`, `supabase/admin-tablas.sql:39` (peticiones insert público)
`/api/track` inserta en `page_views`/`page_events` con la **anon key, sin autenticación ni rate limiting**; el insert público de `peticiones_oracion` tampoco tiene captcha/límite. Un actor puede **inundar** las tablas de analítica o spamear peticiones (coste, ruido, posible degradación).
**Recomendación:** rate limiting por IP (Vercel Edge / Upstash), captcha en el formulario público, y validación de `Origin`.

### 🟡 M3 — `/api/cloudinary` no está gated por rol — `CONFIRMADO`
**Archivo:** `app/api/cloudinary/route.ts:16-21,95-103`
Solo exige **sesión** (cualquier rol). Cualquier usuario autenticado puede **subir archivos** (coste/abuso) y, vía `GET`, **enumerar la biblioteca de medios**. El parámetro `folder` sí está saneado (prefijo `Mieles/`, sin path traversal) — positivo.
**Recomendación:** restringir a roles con permiso de contenido/tesorería según el uso.

### 🟡 M4 — Comprobantes financieros en URL pública de Cloudinary — `CONFIRMADO`
**Archivos:** `app/api/cloudinary/route.ts` (rama `raw`), `ComprobanteUploader.tsx`
Los comprobantes (boletas/facturas) se guardan como recurso `raw` con **URL pública**: cualquiera con la URL accede al documento (seguridad por oscuridad). Puede contener información financiera.
**Recomendación:** para documentos sensibles, usar entrega autenticada/firmada (signed URLs con expiración) o `access_mode: authenticated`.

### 🟡 M6 — Faltan cabeceras de seguridad HTTP — `CONFIRMADO`
**Archivo:** `next.config.ts`
No se definen `Content-Security-Policy`, `X-Frame-Options`/`frame-ancestors`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, ni `Permissions-Policy`. `poweredByHeader` no está desactivado.
**Recomendación:** añadir `async headers()` con las cabeceras de seguridad (mínimo HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors).

### 🟡 M8 — Auditoría best-effort y evitable — `CONFIRMADO`
**Archivos:** `_components/audit.ts`, `supabase/auditoria-soft-delete.sql`
`audit_log` se escribe a nivel de aplicación (best-effort, se ignoran fallos). Las escrituras directas por REST (posibles por H1) **no se auditan**, y un usuario puede **forjar** registros propios (`with check usuario_id = auth.uid()`). El registro no es una fuente de verdad forense.
**Recomendación:** mover la auditoría a **triggers de BD** (`AFTER INSERT/UPDATE/DELETE`) en las tablas sensibles, para capturar toda escritura independientemente del origen.

### Aspectos de seguridad correctos (⚪ informativos)
- **I1** Sin secretos versionados; `.env.local` no está en Git; `.gitignore` cubre `.env*`. `CONFIRMADO`.
- **I2** Auth con `getUser()` (valida el JWT) y no `getSession()` en el middleware. `CONFIRMADO`.
- **I3** `transacciones_financieras` y `miembros_iglesia` **sí** están gated por `mi_rol()`; `directorio_miembros()` expone solo `id+nombre`. `CONFIRMADO`.
- **I4** Sin uso de service_role key en el cliente. `CONFIRMADO`.
- **I5** Uploads a Cloudinary **firmados server-side** (sin preset público en el flujo firmado). `CONFIRMADO`.

**Vectores evaluados y NO aplicables/limpios:** SQL Injection (queries vía PostgREST parametrizadas), Command Injection (no hay `exec`), Path Traversal (folder saneado), secretos en frontend (solo `NEXT_PUBLIC_*` esperadas), deserialización insegura (no aplica).

---

## 9. Dependencias

### 🟡 M1 — 5 vulnerabilidades `high` (transitivas) — `CONFIRMADO`
`npm audit`:
- **postcss** `<=8.5.22` (transitivo de `next`): XSS en stringify, lectura arbitraria de `.map` vía `sourceMappingURL`. 4 advisories.
- **sharp** `<0.35.0` (transitivo de `next`): CVEs heredadas de libvips.

Ambas se resuelven solo actualizando **`next` a 16.3.0** (`npm audit fix --force`), fuera del rango declarado (16.2.7). Son dependencias de **build/optimización**, no de runtime del navegador, lo que **reduce** el impacto en producción. Sin paquetes deprecated/abandonados relevantes fuera de estos.
**Recomendación (Fase 2):** actualizar `next` a ≥16.3.0 y revalidar build/lint.

---

## 10. Base de datos — `PARCIALMENTE CONFIRMADO`

- Motor: PostgreSQL (Supabase). Sin ORM (acceso vía PostgREST/supabase-js). 10 scripts SQL de ejecución manual.
- **RLS habilitada** en todas las tablas del repo (`enable row level security` `CONFIRMADO`).
- **Correcto:** `miembros_iglesia`, `transacciones_financieras`, `turnos_servidores`, `equipos`, `perfiles`, `audit_log` → políticas basadas en `mi_rol()` / `auth.uid()`.
- **Gaps (H1/H3):** `noticias`, `eventos`, `clasificados`, `servicios_semanales`, `peticiones_oracion` → `using(true)`.
- **Índices:** presentes en columnas de filtro (fecha, tipo, categoría, nombre, rut). Bien.
- **`page_views` / `page_events`:** su RLS **no está en el repo** (configurada fuera de los scripts versionados) → **NO VERIFICABLE** aquí; requiere revisión directa en Supabase.
- Sin `SELECT *` peligrosos (los reads seleccionan columnas explícitas). Soft-delete con filtro `eliminado_at is null` en los listados. `CONFIRMADO`.

**No se modificó la base de datos.**

---

## 11. API — `CONFIRMADO`

| Endpoint | Auth | Validación | Observación |
|---|---|---|---|
| `POST /api/track` | ❌ pública | trunca strings | Sin rate limiting → **M2** |
| `GET /api/impacto` | ✅ `getUser()` | `days` en whitelist | Agrega hasta 20.000 filas en JS → **M7** |
| `GET/POST /api/cloudinary` | ✅ sesión | tipo/tamaño, folder saneado | No gated por rol → **M3**; PDF `raw` público → **M4** |

- Manejo de errores defensivo (fail-silent en track, 401 en impacto/cloudinary). Sin stack traces expuestos al cliente.
- No hay CORS custom (mismo origen). Métodos HTTP correctos.

---

## 12. Frontend

- **L1** 8 errores ESLint `set-state-in-effect` (efectos con `setState` sincrónico). Preexistente; no bloquea build.
- **L2** 2 imports/variables sin usar.
- **L3** Componentes muy grandes: `FinanzasModule` (800), `TurnosModule` (724), `DashboardModule` (689), `MiembrosModule` (673). Mantenibilidad. `CONFIRMADO`.
- **L4** Lógica de exportación a PDF por ventana de impresión **duplicada** en varios módulos (finanzas, turnos, servicios, miembros) → DRY.
- **Correcto:** gating de UI por rol, optimistic UI, limpieza de efectos con flag `vivo/activo`, sin PII en `localStorage` (solo preferencias de tema/colapso).

---

## 13. Backend (Server Actions / Route Handlers)

- **M8** Auditoría a nivel app (evitable). Recomendado mover a triggers.
- Server Actions validan y normalizan input, devuelven la fila para UI optimista, respetan RLS. Buen patrón.
- Prevención de auto-bloqueo en `usuarios-actions` (no puedes cambiar tu propio rol/estado). `CONFIRMADO`.
- Sin `catch` vacíos en el árbol (`CONFIRMADO`, 0 coincidencias). Errores devueltos como `{ ok:false, error }`.

---

## 14. Performance

- **M7** `/api/impacto` lee hasta 20.000 filas de `page_views` y agrega en memoria en **cada** carga del dashboard/impacto, sin caché ni vista materializada → **degrada al crecer los datos**. Recomendado: agregación en SQL (RPC) o caché con revalidación.
- Imágenes optimizadas al subir (Cloudinary `q_auto`, límite 1600px) — bien.
- `next/image` con `remotePatterns` correctos. Cargas en `Promise.all` (sin N+1 evidente en servidor).
- Firmas/base64 de miembros almacenadas en `text` (filas grandes) — impacto menor.

---

## 15. Arquitectura

- **L3/L4** Módulos monolíticos grandes y duplicación de exportación PDF. Para el tamaño y propósito del proyecto (panel interno de una iglesia) la arquitectura es **razonable y adecuada**; no se penaliza por no usar Clean Architecture. Recomendado extraer utilidades compartidas (PDF, formato CLP/fecha) y dividir los módulos >600 líneas.
- Separación por dominio y capa de datos ordenada (positivo).

---

## 16. Git — `CONFIRMADO`

- Árbol limpio (`git status` sin cambios), historia lineal coherente (11 commits, mensajes convencionales).
- `.gitignore` cubre `node_modules`, `.next/`, `.env*`. **`.env.local` NO versionado.** Sin dumps/backups/temporales en el repo. Sin secretos en el historial (scan de patrones limpio).

---

## 17. Cobertura de tests

```text
Cobertura de código:            NO DISPONIBLE
Cobertura de autenticación:     NO DISPONIBLE
Cobertura de autorización/RBAC: NO DISPONIBLE
Cobertura de API:               NO DISPONIBLE
Cobertura de lógica financiera: NO DISPONIBLE
Cobertura de lógica médica:     NO DISPONIBLE
Cobertura E2E:                  NO DISPONIBLE
```
→ **M5** (riesgo de regresión sin red de seguridad).

---

## 18. Hallazgos (clasificados)

| ID | Severidad | Título | Archivo(s) | Confianza |
|----|:---:|---|---|---|
| H1 | 🟠 ALTO | RLS `using(true)` permite escritura de cualquier rol (broken access control) | admin-tablas.sql, servicios-semanales.sql, clasificados.sql | PARCIAL |
| H2 | 🟠 ALTO | Usuario desactivado conserva acceso (no hay kill-switch real) | middleware.ts, admin/page.tsx | CONFIRMADO |
| H3 | 🟠 ALTO | Peticiones de oración legibles por todo autenticado | admin-tablas.sql:44 | PARCIAL |
| M1 | 🟡 MEDIO | 5 vulns `high` (postcss/sharp) vía next@16.2.7 | package.json | CONFIRMADO |
| M2 | 🟡 MEDIO | Endpoints públicos sin rate limiting | api/track/route.ts, admin-tablas.sql | CONFIRMADO |
| M3 | 🟡 MEDIO | `/api/cloudinary` sin gating por rol | api/cloudinary/route.ts | CONFIRMADO |
| M4 | 🟡 MEDIO | Comprobantes financieros en URL pública Cloudinary | ComprobanteUploader.tsx, route.ts | CONFIRMADO |
| M5 | 🟡 MEDIO | Sin tests / 0% cobertura (datos financieros y médicos) | package.json | CONFIRMADO |
| M6 | 🟡 MEDIO | Faltan cabeceras de seguridad HTTP | next.config.ts | CONFIRMADO |
| M7 | 🟡 MEDIO | `/api/impacto` agrega hasta 20k filas en memoria sin caché | api/impacto/route.ts | CONFIRMADO |
| M8 | 🟡 MEDIO | Auditoría best-effort y evitable (no en triggers) | audit.ts, auditoria-soft-delete.sql | CONFIRMADO |
| L1 | 🔵 BAJO | 8 errores ESLint `set-state-in-effect` | AdminShell/Navbar/PeticionesModule | CONFIRMADO |
| L2 | 🔵 BAJO | 2 variables/imports sin usar | evangelizacion/page.tsx, StoryTimeline.tsx | CONFIRMADO |
| L3 | 🔵 BAJO | Componentes >600 líneas (mantenibilidad) | FinanzasModule, TurnosModule… | CONFIRMADO |
| L4 | 🔵 BAJO | Duplicación de exportación PDF (DRY) | varios módulos | CONFIRMADO |
| L5 | 🔵 BAJO | Sin política DELETE en peticiones_oracion | admin-tablas.sql | CONFIRMADO |
| I1–I5 | ⚪ INFO | Buenas prácticas confirmadas (ver §8) | — | CONFIRMADO |

**Conteo:** 🔴 0 · 🟠 3 · 🟡 8 · 🔵 5 · ⚪ 5.

---

## 19. Riesgos

1. **Integridad del contenido público y privacidad interna** (H1/H2/H3): el RBAC real depende de RLS incompleta; un insider de bajo privilegio o un usuario desactivado puede alterar contenido o leer peticiones.
2. **Sin red de seguridad de regresión** (M5): cambios futuros en lógica financiera/médica no tienen verificación automatizada.
3. **Abuso/coste** (M2/M3/M4): endpoints públicos y de subida sin límites.
4. **Deuda de dependencias** (M1): requiere subir `next`.

---

## 20. Plan de remediación (propuesto para Fase 2)

**Prioridad 1 — Control de acceso (rápido, alto impacto):**
1. Reescribir RLS de `noticias`, `eventos`, `clasificados`, `servicios_semanales`, `peticiones_oracion` con `mi_rol()` (H1, H3).
2. Bloquear usuarios `activo=false` en middleware/layout y revocar sesión al desactivar (H2).
3. Verificar en Supabase la RLS real de `page_views`/`page_events` (no verificable desde el repo).

**Prioridad 2 — Endurecimiento:**
4. Cabeceras de seguridad en `next.config.ts` (M6).
5. Rate limiting + captcha en `/api/track` y formulario de peticiones (M2).
6. Gating por rol en `/api/cloudinary` + signed URLs para comprobantes (M3, M4).
7. Auditoría por triggers de BD (M8).

**Prioridad 3 — Calidad y mantenimiento:**
8. Introducir Vitest + Playwright; tests de RBAC/RLS, Server Actions financieras y flujos críticos (M5).
9. Actualizar `next` ≥16.3.0 y revalidar (M1).
10. Corregir 8 errores ESLint y limpiar imports (L1, L2); extraer utilidades PDF/formair y dividir módulos grandes (L3, L4).

> Cada corrección de Fase 2 debe acompañarse de un **test de regresión** que demuestre el fix.

---

## VERIFICACIONES PENDIENTES (no verificable en esta fase)

Requieren credenciales / entorno / acción manual no disponibles en una auditoría de solo lectura del repo:

- **Estado real de RLS en la BD en vivo** (H1/H3/§10): confirmar qué políticas están efectivamente aplicadas en Supabase, incluida la de `page_views`/`page_events` (no está en el repo). **NO VERIFICABLE.**
- **Explotación práctica de H1/H2**: requiere una sesión de usuario de bajo privilegio y llamadas REST directas a Supabase. **NO VERIFICABLE** sin credenciales de prueba.
- **Vulnerabilidad efectiva de M1 en runtime**: depende de la configuración de build de Vercel. **PARCIALMENTE CONFIRMADO.**
- **Config de entrega de PDF/seguridad de Cloudinary** (M4): revisar en el panel de Cloudinary. **NO VERIFICABLE.**
- **Rendimiento real de `/api/impacto`** (M7): requiere volumen de datos de producción. **NO VERIFICABLE.**
- **Rotación/expiración de sesiones al desactivar** (H2): requiere prueba con usuario real. **NO VERIFICABLE.**
- **CI/CD y cabeceras en el edge de Vercel**: no hay config de CI en el repo. **NO VERIFICABLE.**

---

## TOP 10 PROBLEMAS A SOLUCIONAR PRIMERO

1. **H1 — RLS `using(true)` (broken access control)** en noticias/eventos/clasificados/servicios/peticiones. *Alto impacto, fácil de corregir.*
2. **H2 — Usuario desactivado conserva acceso.** *El "desactivar" no protege; corregir middleware/layout.*
3. **H3 — Peticiones de oración legibles por todos.** *Privacidad de datos sensibles.*
4. **M8 — Auditoría por triggers de BD.** *Sin esto, la traza es forjable/evitable (agrava H1).*
5. **M2 — Rate limiting en endpoints públicos.** *Anti-abuso/coste.*
6. **M6 — Cabeceras de seguridad HTTP.** *Endurecimiento base de bajo esfuerzo.*
7. **M4 — Comprobantes financieros públicos → signed URLs.**
8. **M3 — Gating por rol en `/api/cloudinary`.**
9. **M1 — Actualizar `next` ≥16.3.0** (cierra 5 vulns `high`).
10. **M5 — Introducir tests** (RBAC/RLS + Server Actions financieras) como red de regresión.

---

*Fin del informe — Fase 1 (solo lectura). No se realizaron cambios en código, configuración, BD ni Git. Pendiente de autorización para Fase 2 (corrección controlada con tests de regresión).*
