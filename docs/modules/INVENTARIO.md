# Módulo de Inventario y Bienes

Gestión del catálogo de bienes de la iglesia, su estado, valorización y el
control de préstamos/devoluciones. Uso interno del panel administrativo.

---

## 1. Resumen ejecutivo y arquitectura

El módulo permite registrar los bienes de la iglesia (instrumentos, mobiliario,
audio/video, etc.), valorizarlos en CLP, conocer su estado y ubicación, y llevar
un control de **préstamos** con historial. Se construyó siguiendo los patrones
ya establecidos en la plataforma (RLS por rol, Server Actions, soft-delete,
auditoría por triggers, directorio seguro y exportación PDF compartida).

### Modelo de datos (`supabase/inventario-bienes.sql`)

**`bienes`** — catálogo:
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `nombre` | text | obligatorio |
| `categoria` | text → `categorias_bien(nombre)` | FK `on update cascade` |
| `cantidad` | int (≥ 0) | stock |
| `estado` | `estado_bien` (ENUM) | `nuevo`/`bueno`/`regular`/`reparacion`/`baja` |
| `ubicacion` | text | opcional |
| `responsable_id` | uuid → `miembros_iglesia` | `on delete set null` |
| `valor` | numeric(14,2) (≥ 0) | CLP |
| `fecha_adquisicion` | date | opcional |
| `nro_serie`, `foto_url`, `notas` | text | opcionales |
| `eliminado_at` | timestamptz | **soft-delete** |
| `creado_at`, `actualizado_at` | timestamptz | |

**`prestamos_bienes`** — movimientos de préstamo:
| Campo | Notas |
|---|---|
| `bien_id` → `bienes` | `on delete cascade` |
| `miembro_id` → `miembros_iglesia` | prestatario |
| `cantidad` | int (> 0) |
| `fecha_prestamo` | date |
| `fecha_devolucion_esperada` | date, opcional |
| `fecha_devolucion_real` | date · **`NULL` = préstamo vigente** |
| `notas` | text |

**`categorias_bien`** — tabla de referencia extensible (sembrada con
Instrumentos, Audio/Video, Mobiliario, Cocina, Aseo/Mantención, Otros).

### Decisiones de arquitectura

- **Estado como ENUM, categorías como tabla:** el ciclo de vida del bien es
  fijo (ENUM `estado_bien`), mientras que las categorías pueden crecer, por lo
  que viven en una tabla de referencia (`categorias_bien`) con FK.
- **Patrón de disponibilidad:** no se almacena un flag "prestado". Un bien está
  prestado si existe un registro en `prestamos_bienes` con
  `fecha_devolucion_real IS NULL`. Un **índice parcial**
  (`prestamos_abiertos_idx ... where fecha_devolucion_real is null`) hace esa
  consulta eficiente. Devolver = marcar `fecha_devolucion_real`.
- **Soft-delete:** eliminar un bien marca `eliminado_at`; los listados filtran
  `eliminado_at IS NULL`, de modo que nada se pierde por un clic. Consistente
  con Tesorería y Fichas.
- **Valorización separada:** el valor se registra por bien y el total se muestra
  en KPIs, sin acoplarse a Tesorería (módulos independientes).

---

## 2. Seguridad y RBAC

### Rol `logistica`

Rol dedicado a la gestión de bienes. Su alcance en `AdminShell` (`ACCESO_EXTRA`):

| Accede | No accede |
|---|---|
| Dashboard · Turnos · Servicios · **Inventario** | Finanzas · Fichas · Peticiones · Usuarios · Auditoría |

`admin` y `pastor` mantienen acceso total. El rol se integró en: tipo `Rol`,
check de `perfiles`, `UsuariosModule` (badge teal), `usuarios-actions`,
`directorio_miembros()` y `ROLES_SUBIDA` de `/api/cloudinary` (para subir fotos).

### Políticas RLS

Ambas tablas y `categorias_bien` usan la misma barrera basada en `mi_rol()`
(que respeta el flag `activo`, por lo que un usuario desactivado queda fuera):

```sql
for all to authenticated
using  (public.mi_rol() in ('admin', 'pastor', 'logistica'))
with check (public.mi_rol() in ('admin', 'pastor', 'logistica'));
```

La RLS es la **barrera real**; las Server Actions añaden una comprobación de rol
como defensa en profundidad. El dropdown de responsable/prestatario se alimenta
de `directorio_miembros()` (`SECURITY DEFINER`), que expone **solo `id + nombre`**
de los miembros — sin datos médicos ni de contacto.

### Auditoría inalterable (M8)

`bienes` y `prestamos_bienes` tienen el trigger `trg_audit` que invoca
`fn_audit_log_trigger()` (`SECURITY DEFINER`). Toda alta/edición/eliminación y
todo préstamo/devolución queda registrado automáticamente en `audit_log` con
`old_record`/`new_record`, sin que la aplicación pueda saltárselo. Visible para
admin/pastor en el módulo de Auditoría.

---

## 3. Server Actions y pruebas

### `inventario-actions.ts`
| Acción | Descripción |
|---|---|
| `crearBien(input)` | Alta. Valida sesión + rol + saneo; devuelve la fila. |
| `actualizarBien(id, input)` | Edición; actualiza `actualizado_at`. |
| `eliminarBien(id)` | **Soft-delete** (marca `eliminado_at`). |

### `prestamos-actions.ts`
| Acción | Descripción |
|---|---|
| `crearPrestamo(input)` | Registra un préstamo (valida bien, prestatario y cantidad > 0). |
| `registrarDevolucion(id, fecha?)` | Marca `fecha_devolucion_real`. Filtra `.is('fecha_devolucion_real', null)` → **no se puede devolver dos veces**. |
| `eliminarPrestamo(id)` | Corrige un registro erróneo. |

Todas validan **sesión + rol (`admin`/`pastor`/`logistica`) + saneo** de inputs
y devuelven el patrón `Resultado<T>`. La auditoría la registran los triggers.

### Pruebas (Vitest)

`tests/unit/inventario-actions.test.ts` y `tests/unit/prestamos-actions.test.ts`
cubren (con Supabase mockeado, incluyendo `mi_rol` y `maybeSingle`): sesión
ausente, rol sin permisos, validaciones (nombre/estado/cantidad/valor,
prestatario), inserción saneada, soft-delete y **doble devolución bloqueada**.
Se ejecutan en el CI (`.github/workflows/tests.yml`) en cada push/PR.

---

## 4. Uso del módulo

### Gestión de préstamos
1. En la fila de un bien, botón **⇄ (Préstamos y devoluciones)**.
2. **Registrar préstamo:** elegir prestatario (directorio), cantidad, fecha y
   (opcional) fecha de devolución esperada + notas. El bien pasa a
   **"Prestado a X"** en la columna Disponibilidad, en vivo.
3. **Devolver:** botón *Devolver* junto a cada préstamo vigente; el bien vuelve
   a **"Disponible"** y el préstamo pasa al **Historial devuelto**.

### Exportación a PDF
- Botón **Exportar** en la barra de herramientas.
- Genera un documento **horizontal** con KPIs (Ítems · Valor total · Prestados)
  y la tabla valorizada (Bien, Categoría, Estado, Cantidad, Ubicación,
  Responsable, Disponibilidad, Valor).
- **Respeta los filtros activos** (categoría/estado) — exporta lo que ves.
- Usa la utilidad compartida `src/utils/exportPdf.ts` (mismo esqueleto que
  Finanzas/Turnos/Servicios/Fichas). Requiere permitir ventanas emergentes.

---

## Archivos del módulo

| Tipo | Archivos |
|---|---|
| SQL | `supabase/inventario-bienes.sql` |
| Server Actions | `app/(admin)/admin/_components/inventario-actions.ts`, `prestamos-actions.ts` |
| UI | `app/(admin)/admin/_components/InventarioModule.tsx` |
| Tests | `tests/unit/inventario-actions.test.ts`, `tests/unit/prestamos-actions.test.ts` |
| Compartidos | `src/utils/exportPdf.ts`, `directorio_miembros()`, `fn_audit_log_trigger()` |
