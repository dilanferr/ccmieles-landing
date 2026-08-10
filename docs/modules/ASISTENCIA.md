# Módulo de Asistencia y Check-in

Registro ágil de asistencia de miembros y visitantes en cultos y eventos, con
una pantalla de **check-in rápido** optimizada para usar en vivo desde el
celular. Uso interno del panel administrativo.

---

## 1. Arquitectura y modelo de datos

El módulo gestiona **sesiones** (cultos/eventos) y las **asistencias** de cada
persona a esas sesiones. Sigue los patrones del proyecto: RLS por rol, Server
Actions, soft-delete, auditoría por triggers, directorio seguro y exportación
PDF compartida.

### Tablas (`supabase/asistencia-checkin.sql` + `supabase/asistencia-cerrar-sesion.sql`)

**`eventos_cultos`** — una sesión donde se toma asistencia:
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `nombre` | text | obligatorio |
| `tipo` | text | `culto` \| `evento` |
| `fecha` | date | |
| `hora`, `descripcion` | text | opcionales |
| `cerrada_at` | timestamptz | **NULL = abierta**; con fecha = finalizada |
| `eliminado_at` | timestamptz | **soft-delete** |
| `creado_at`, `actualizado_at` | timestamptz | |

**`asistencias`** — una fila por persona presente en una sesión:
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `evento_culto_id` | uuid → `eventos_cultos` | `on delete cascade` |
| `miembro_id` | uuid → `miembros_iglesia` | `on delete set null` (null si visitante) |
| `visitante_nombre` | text | para visitantes sin ficha |
| `tipo_asistente` | text | `miembro` \| `visitante` (con CHECK de coherencia) |
| `eliminado_at` | timestamptz | **soft-delete reversible** (check-out) |
| `registrado_at` | timestamptz | |

### Decisiones de arquitectura

- **Idempotencia a nivel de BD (23505):** un índice único parcial
  `(evento_culto_id, miembro_id) where miembro_id is not null and eliminado_at is null`
  impide que un miembro quede registrado dos veces (activo) en la misma sesión.
  Si ocurre, PostgreSQL devuelve `23505` y la Server Action lo traduce a un
  mensaje claro (*"El miembro ya está registrado en esta sesión"*).
- **Soft-delete reversible:** el check-out marca `eliminado_at` (no borra). Como
  el índice único excluye los eliminados, re-hacer check-in inserta una fila
  nueva; todo el ida y vuelta queda en la auditoría. Los conteos filtran
  `eliminado_at IS NULL`.
- **Cierre vs. eliminación:** `cerrada_at` finaliza una sesión (queda visible,
  bloquea nuevos check-in, se puede reabrir); `eliminado_at` la retira. Son
  estados distintos.
- **Visitantes:** `miembro_id` nulo + `visitante_nombre`; el CHECK garantiza la
  coherencia miembro/visitante.

---

## 2. Seguridad y RBAC

Registran asistencia: **`admin`, `pastor`, `lider`, `secretaria`** (roles
existentes, **sin rol nuevo**). Acceso en `AdminShell`:
`ACCESO_EXTRA.asistencia = ["lider", "secretaria"]` + acceso total de
admin/pastor.

### RLS

Ambas tablas usan la misma barrera basada en `mi_rol()` (que respeta `activo`):

```sql
for all to authenticated
using  (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'))
with check (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'));
```

La RLS es la barrera real; las Server Actions añaden comprobación de rol como
defensa en profundidad. El buscador de miembros usa `directorio_miembros()`
(`SECURITY DEFINER`, ya incluye a `lider` y `secretaria`), que expone **solo
`id + nombre`** — sin datos médicos ni de contacto.

### Auditoría inalterable (M8)

`eventos_cultos` y `asistencias` tienen el trigger `trg_audit`
(`fn_audit_log_trigger()`, `SECURITY DEFINER`): toda sesión, check-in y check-out
queda registrado automáticamente en `audit_log` con `old_record`/`new_record`,
sin que la aplicación pueda saltárselo.

---

## 3. Server Actions y pruebas

### `asistencia-actions.ts`
| Acción | Descripción |
|---|---|
| `crearSesionCulto(input)` | Apertura un culto/evento. |
| `actualizarSesionCulto(id, input)` | Edita la sesión. |
| `cerrarSesionCulto(id, cerrar=true)` | Marca `cerrada_at` o **reabre** (`cerrar=false`). |
| `eliminarSesionCulto(id)` | **Soft-delete** (`eliminado_at`). |
| `registrarCheckIn(input)` | Asistencia de miembro (`miembro_id`) o visitante (`visitante_nombre`); traduce `23505`. |
| `registrarCheckOut(asistenciaId)` | **Soft-delete reversible** de una asistencia. |

Todas validan **sesión + rol + saneo** y devuelven el patrón `Resultado<T>`.
La auditoría la registran los triggers.

### Pruebas (Vitest)

`tests/unit/asistencia-actions.test.ts` cubre (con Supabase mockeado, incluyendo
`mi_rol` y códigos de error): sesión ausente, rol sin permisos, validaciones,
check-in de miembro, **traducción de `23505`**, check-out (soft-delete) y
cierre/reapertura de sesión. Corren en el CI en cada push/PR.

---

## 4. UX del Check-in rápido y exportación

### Flujo de check-in (móvil-first)
1. En la lista de sesiones, **Tomar asistencia** en la sesión deseada.
2. **Buscador instantáneo:** filtra el directorio por nombre en cliente (0
   latencia).
3. **Un toque:** cada miembro es un botón grande; tocarlo lo marca *Presente*
   (verde ✓) al instante (**UI optimista**), tocar de nuevo lo quita. Un bloqueo
   por miembro evita el doble tap.
4. **Visitantes:** formulario directo (nombre → chip; quitar con ×).
5. **Contador en vivo:** total presentes · miembros · visitantes, con **barra de
   progreso** (% de miembros presentes).
6. **Cerrar/Reabrir:** una sesión cerrada pasa a modo lectura; se puede reabrir.

### Exportación a PDF
- Botón **Exportar** en la cabecera del check-in.
- Genera un reporte con encabezado de la sesión, totales y el **listado
  numerado** de asistentes (Nombre + tipo Miembro/Visitante), ordenado
  alfabéticamente.
- Usa la utilidad compartida `src/utils/exportPdf.ts`. Requiere permitir
  ventanas emergentes.

---

## Archivos del módulo

| Tipo | Archivos |
|---|---|
| SQL | `supabase/asistencia-checkin.sql`, `supabase/asistencia-cerrar-sesion.sql` |
| Server Actions | `app/(admin)/admin/_components/asistencia-actions.ts` |
| UI | `app/(admin)/admin/_components/AsistenciaModule.tsx` |
| Tests | `tests/unit/asistencia-actions.test.ts` |
| Compartidos | `src/utils/exportPdf.ts`, `directorio_miembros()`, `fn_audit_log_trigger()` |
