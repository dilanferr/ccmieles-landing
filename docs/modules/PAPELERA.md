# Módulo de Papelera / Centro de Restauración

Red de seguridad del panel: reúne en un solo lugar todos los registros
**eliminados (soft-delete)** de los módulos que lo soportan, permitiendo
**restaurarlos** si el borrado fue un error o **eliminarlos definitivamente**
(borrado físico irreversible). Uso interno, restringido a la administración.

---

## 1. Arquitectura

La Papelera **no tiene tabla propia**: es una vista agregada sobre las tablas
que ya usan el patrón de _soft-delete_ del proyecto (`eliminado_at`). Cada
módulo marca `eliminado_at` al "eliminar" y filtra `eliminado_at IS NULL` en sus
listados; la Papelera hace justo lo contrario: consulta `eliminado_at IS NOT
NULL` y unifica los resultados.

### Allowlist de tablas (soft-delete)

Solo estas **6 tablas** son gestionables desde la Papelera. La lista es una
**allowlist estricta** en el servidor (`TABLAS`): cualquier tabla fuera de ella
es rechazada antes de tocar la base de datos, evitando inyección de tabla
arbitraria.

| Tabla | Tipo (etiqueta) | Etiqueta mostrada | Detalle |
|---|---|---|---|
| `transacciones_financieras` | **Finanzas** | `Ingreso/Egreso · $monto` | categoría · fecha |
| `miembros_iglesia` | **Fichas** | nombre completo | "Ficha de miembro" |
| `bienes` | **Inventario** | nombre del bien | categoría |
| `asistencias` | **Asistencia** | nombre del visitante / "Asistencia de miembro" | "Registro de asistencia" |
| `eventos_cultos` | **Cultos** | nombre de la sesión | Culto/Evento · fecha |
| `consolidacion` | **Consolidación** | nombre de la persona | Consolidación · estado |

> Otras entidades del panel (turnos, servicios, préstamos, noticias, eventos
> públicos, clasificados) usan **borrado físico** directo y por diseño **no**
> pasan por la Papelera.

### Modelo de datos unificado (`PapeleraItem`)

Cada registro eliminado se normaliza a una forma común, independiente de su tabla
de origen:

```ts
type PapeleraItem = {
  tabla: PapeleraTabla; // tabla de origen (allowlist)
  tipo: string;         // etiqueta de origen: Finanzas | Fichas | Inventario | Asistencia | Cultos
  id: string;
  etiqueta: string;     // descripción principal legible
  detalle: string;      // contexto secundario
  eliminado_at: string; // timestamp del borrado
};
```

`listarPapelera()` consulta las 6 tablas **en paralelo** (`Promise.all`), mapea
cada fila con la config de su tabla, aplana y ordena por `eliminado_at`
descendente (lo más reciente arriba). **Resiliencia:** si una tabla falla (RLS,
red, permiso), esa consulta devuelve `[]` y el resto de la papelera se muestra
igual, sin romper el listado completo.

---

## 2. Seguridad y RBAC

La acción sensible aquí es el **borrado físico irreversible**, por eso la matriz
de permisos separa claramente restaurar de purgar.

### Matriz de permisos por rol

| Acción | admin | pastor | Resto de roles |
|---|:---:|:---:|:---:|
| **Ver** la papelera (`listarPapelera`) | ✅ | ✅ | ❌ |
| **Restaurar** (`restaurarRegistro`) | ✅ | ✅ | ❌ |
| **Eliminar definitivamente** (`purgarRegistro`) | ✅ | ❌ | ❌ |

- `ROLES_RESTAURAR = ["admin", "pastor"]` → ver + restaurar.
- `ROLES_PURGAR = ["admin"]` → **purga exclusiva de administrador**.

### Gating en dos capas

1. **UI (`AdminShell`):** la pestaña *Papelera* (grupo *Administración*) no está
   en `ACCESO_EXTRA`, por lo que `puedeVer()` la resuelve **solo** vía
   `ROLES_TOTALES = ["admin", "pastor"]`. El mismo guard bloquea `ir("papelera")`
   para cualquier otro rol. En el módulo, el botón **Eliminar definitivamente**
   se renderiza únicamente si `rol === "admin"`.
2. **Server Actions (defensa en profundidad):** cada acción revalida sesión +
   rol vía `mi_rol()` antes de ejecutar. Aunque alguien invocara la acción
   directamente, un pastor **no** puede purgar y un rol sin permisos no ve nada.
   La UI es comodidad; **la barrera real es el servidor** (más la RLS de cada
   tabla).

### Confirmaciones en la UI

- **Restaurar:** confirmación simple.
- **Eliminar definitivamente:** **doble confirmación** para evitar pérdidas
  accidentales, dado que el borrado es físico e irreversible.

---

## 3. Gestión de colisiones al restaurar (error `23505`)

Restaurar es un `UPDATE eliminado_at = NULL`. Algunas tablas tienen **índices
únicos parciales** que solo aplican a filas activas (`where eliminado_at is
null`) — por ejemplo, evitar dos asistencias activas del mismo miembro en la
misma sesión. Si, mientras un registro estaba en la papelera, se creó otro
registro **activo equivalente**, restaurarlo chocaría contra ese índice y
PostgreSQL devuelve el código **`23505` (unique_violation)**.

`restaurarRegistro()` detecta ese código y lo traduce a un mensaje claro para el
usuario, en vez de exponer un error técnico:

```
"Ya existe un registro activo equivalente; no se puede restaurar."
```

Así el pastor entiende que el "hueco" ya fue ocupado y que no hay nada que
recuperar sin resolver antes el duplicado.

---

## 4. Integración con la auditoría (M8)

Las tablas de la allowlist tienen el trigger `trg_audit`
(`fn_audit_log_trigger()`, `SECURITY DEFINER`). Por eso, **sin código extra** en
la Papelera:

- **Restaurar** → es un `UPDATE` → queda en `audit_log` con
  `old_record`/`new_record` (se ve el paso de `eliminado_at` con fecha a `NULL`).
- **Eliminar definitivamente** → es un `DELETE` → queda registrado con el
  `old_record` completo antes de desaparecer la fila.

De este modo, incluso el borrado irreversible deja **rastro inalterable** de
quién y cuándo, sin que la aplicación pueda saltárselo. (El trigger ya redacta
campos sensibles como `firma`.)

---

## 5. Server Actions y pruebas

### `papelera-actions.ts`

| Acción | Rol | Descripción |
|---|---|---|
| `listarPapelera()` | admin/pastor | Consulta las 6 tablas en paralelo (`eliminado_at IS NOT NULL`), normaliza a `PapeleraItem[]` y ordena por fecha desc. |
| `restaurarRegistro(tabla, id)` | admin/pastor | `UPDATE eliminado_at = NULL`; traduce `23505` a mensaje claro; valida allowlist. |
| `purgarRegistro(tabla, id)` | **solo admin** | `DELETE` físico irreversible; valida allowlist. |

Todas validan **sesión + rol** y usan el patrón `Resultado<T>`. La auditoría la
registran los triggers de BD.

### Pruebas (Vitest)

`tests/unit/papelera-actions.test.ts` cubre (con Supabase mockeado, incluyendo
`mi_rol` y códigos de error): sesión ausente, rol sin permisos, que se consulten
**las 6 tablas** con `.not("eliminado_at","is",null)`, rechazo de tabla fuera de
la allowlist, restauración (`eliminado_at = null`), **traducción de `23505`**, y
la separación de permisos de purga (**pastor no puede / admin sí**). Corren en el
CI en cada push/PR.

---

## 6. UX del módulo

- **KPIs:** total en papelera + desglose por tipo (Finanzas · Fichas ·
  Inventario · Asistencia · Cultos · Consolidación).
- **Filtros:** chips con contador — *Todos* + los 6 tipos; el activo se resalta.
- **Tabla responsiva** (`overflow-x-auto`): Tipo (badge por color), Descripción,
  Detalle, *Eliminado el* (fecha/hora `es-CL`) y Acciones.
- **Acciones por fila:** *Restaurar* (admin/pastor) y *Eliminar def.* (solo
  admin). Un estado `procesando` por fila (spinner + `disabled`) evita el doble
  clic; al éxito la fila desaparece de la lista y se muestra una `Alerta`.
- **Estado vacío cálido** cuando no hay nada que recuperar.

---

## Archivos del módulo

| Tipo | Archivos |
|---|---|
| Server Actions | `app/(admin)/admin/_components/papelera-actions.ts` |
| UI | `app/(admin)/admin/_components/PapeleraModule.tsx` |
| Navegación / RBAC | `app/(admin)/admin/_components/AdminShell.tsx`, `types.ts` |
| Tests | `tests/unit/papelera-actions.test.ts` |
| Compartidos | `mi_rol()`, `fn_audit_log_trigger()`, patrón `eliminado_at` de cada tabla |

> **Sin SQL nuevo:** la Papelera reutiliza el `eliminado_at`, los triggers de
> auditoría y `mi_rol()` que ya existen. No requiere migraciones.
