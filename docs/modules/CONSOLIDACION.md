# Módulo de Consolidación de Visitantes

Motor de **pipeline pastoral**: convierte a un visitante suelto (un nombre en el
check-in) en un **recorrido trazable** —de recibido a integrado a la familia—
con responsable asignado e historial de notas. Uso interno del panel.

---

## 1. Arquitectura y modelo de datos

Sigue los patrones del proyecto: RLS por rol, Server Actions, soft-delete
(Papelera), auditoría por triggers (M8) y directorio seguro (`SECURITY DEFINER`).

### Tablas (`supabase/consolidacion.sql`)

**`consolidacion`** — una fila por persona en el recorrido:
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `nombre` | text | obligatorio |
| `telefono`, `email`, `direccion` | text | contacto para seguimiento |
| `estado` | text | `recibido` \| `contactado` \| `en_proceso` \| `integrado` \| `no_continua` (CHECK) |
| `responsable_id` | uuid → `perfiles` | servidor/líder que da seguimiento (`on delete set null`) |
| `origen` | text | `asistencia` \| `manual` \| `web` (CHECK) |
| `asistencia_id` | uuid → `asistencias` | check-in que lo originó (`on delete set null`) |
| `miembro_id` | uuid → `miembros_iglesia` | se llena al convertirlo en ficha (`on delete set null`) |
| `bautizado` | boolean | + `fecha_bautismo` (date) opcional |
| `fecha_recepcion` | date | primer contacto (default hoy) |
| `eliminado_at` | timestamptz | **soft-delete** → Papelera |
| `creado_at`, `actualizado_at` | timestamptz | |

**`consolidacion_notas`** — historial pastoral, **append-only** (línea de tiempo):
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `consolidacion_id` | uuid → `consolidacion` | `on delete cascade` |
| `autor_id` | uuid → `perfiles` | quién escribió (`on delete set null`) |
| `tipo` | text | `llamada` \| `visita` \| `oracion` \| `general` (CHECK) |
| `nota` | text | obligatoria |
| `creado_at` | timestamptz | |

### Decisiones de arquitectura

- **Idempotencia a nivel de BD:** un índice único parcial
  `(asistencia_id) where asistencia_id is not null and eliminado_at is null`
  impide que un mismo check-in genere dos consolidaciones activas. Si se
  reintenta, PostgreSQL devuelve `23505` y la Server Action lo traduce a *"Este
  visitante ya está en consolidación"*.
- **Índices de trabajo:** `(estado)` y `(responsable_id)` (ambos parciales
  `where eliminado_at is null`) para el tablero y los filtros.
- **Notas append-only:** solo se insertan; no hay acción de editar/borrar nota.
  El historial pastoral es inmutable por diseño (y auditado por M8).

---

## 2. El pipeline (los 5 estados)

```
Recibido  →  Contactado  →  En Proceso / Célula  →  Integrado / Bautizado
(llegó)      (1er           (célula o visita        (miembro activo, opcional
             seguimiento)   pastoral)               ficha + bautismo)
                                     ↘ No continúa  (dejó de responder —
                                                     no infla métricas)
```

- Las **4 etapas** del recorrido se muestran como columnas del tablero Kanban.
- **No continúa** es la vía de escape (se ve activando *"Ver descartados"*).
- El cambio de etapa es libre (avanzar o retroceder) desde la card o el drawer.

### Conversión a miembro

Al llegar a **Integrado**, `convertirEnMiembro()` crea la ficha en
`miembros_iglesia` (mapeando `email → correo`, `fecha_ingreso = hoy`), guarda el
`miembro_id` en la consolidación y marca `integrado`. Cierra el ciclo
**visitante → miembro** sin recapturar datos. No duplica si ya hay ficha
vinculada.

---

## 3. Seguridad y RBAC

Equipo de consolidación: **`admin`, `pastor`, `lider`, `secretaria`** (roles
existentes, **sin rol nuevo**). Acceso en `AdminShell`:
`ACCESO_EXTRA.consolidacion = ["lider", "secretaria"]` + acceso total de
admin/pastor.

### Matriz de permisos por acción

| Acción | admin | pastor | lider | secretaria |
|---|:---:|:---:|:---:|:---:|
| Ver el tablero, alta, editar contacto | ✅ | ✅ | ✅ | ✅ |
| Cambiar etapa / asignar responsable | ✅ | ✅ | ✅ | ✅ |
| Agregar nota pastoral | ✅ | ✅ | ✅ | ✅ |
| Eliminar (soft-delete → Papelera) | ✅ | ✅ | ✅ | ✅ |
| **Convertir en miembro** (`convertirEnMiembro`) | ✅ | ✅ | ❌ | ❌ |

- **`convertirEnMiembro` queda restringida a admin/pastor**: escribe en
  `miembros_iglesia`, una tabla de **datos sensibles**. Los `lider`/`secretaria`
  mueven el pipeline y registran notas, pero **no** crean fichas. En la UI el
  botón *"Convertir en miembro"* solo se renderiza para admin/pastor; la Server
  Action revalida el rol como defensa en profundidad.

### RLS

Ambas tablas usan la barrera basada en `mi_rol()` (que respeta `activo`):

```sql
for all to authenticated
using  (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'))
with check (public.mi_rol() in ('admin', 'pastor', 'lider', 'secretaria'));
```

La RLS es la barrera real; las Server Actions añaden comprobación de rol.

### Auditoría inalterable (M8)

`consolidacion` y `consolidacion_notas` tienen el trigger `trg_audit`
(`fn_audit_log_trigger()`, `SECURITY DEFINER`): cada cambio de etapa, asignación,
nota, conversión y borrado queda registrado automáticamente en `audit_log`, sin
que la aplicación pueda saltárselo.

---

## 4. Server Actions y pruebas

### `consolidacion-actions.ts`
| Acción | Rol | Descripción |
|---|---|---|
| `crearConsolidacion(input)` | equipo | Alta manual (`origen='manual'`, `estado='recibido'`). |
| `consolidarDesdeAsistencia(asistenciaId)` | equipo | Envía el visitante del check-in al pipeline. **Idempotente** (índice único + traducción de `23505`). |
| `actualizarContacto(id, input)` | equipo | Edita nombre/teléfono/email/dirección. |
| `cambiarEstado(id, estado)` | equipo | Avanza/retrocede etapa; valida el enum. |
| `asignarResponsable(id, responsableId)` | equipo | Vincula o quita (`null`) el responsable. |
| `agregarNota(id, tipo, nota)` | equipo | Inserta nota (autor = usuario). Append-only. |
| `eliminarConsolidacion(id)` | equipo | **Soft-delete** (`eliminado_at`) → Papelera. |
| `convertirEnMiembro(id)` | **admin/pastor** | Crea ficha en `miembros_iglesia`, vincula `miembro_id` y marca `integrado`. |

Todas validan **sesión + rol + saneo** y devuelven el patrón `Resultado<T>`.

### Pruebas (Vitest)

`tests/unit/consolidacion-actions.test.ts` cubre (con Supabase mockeado): sesión
ausente, rol sin permisos, validaciones, alta, **idempotencia (`23505`)**, enum de
estado inválido, asignación de responsable, **notas append-only** (autor/tipo),
soft-delete, y `convertirEnMiembro` (líder bloqueado · no duplica si ya hay ficha
· crea y vincula). Corren en el CI en cada push/PR.

---

## 5. UX — Tablero Kanban y drawer pastoral

- **KPIs:** En seguimiento · Integrados · **Tasa de conversión** (integrados /
  total no-descartado) · Sin responsable.
- **Tablero Kanban:** columnas por etapa con contador; card con nombre,
  contacto, responsable (o *"Sin asignar"* en ámbar), días desde recepción, ✔ si
  ya es miembro, y **`<select>` de cambio rápido de etapa** (no abre el drawer).
  Toggle *"Ver descartados"* muestra la columna *No continúa*.
- **Responsivo:** cards **apiladas** (`flex-col`) en móvil; **tablero con scroll
  horizontal** (`lg:flex-row`) en desktop.
- **Drawer de detalle pastoral:** editar contacto, asignar responsable, cambiar
  etapa, **convertir en miembro** (admin/pastor), eliminar, y **timeline de
  notas** (badge por tipo + autor + fecha, con formulario para agregar).
- **Alta manual:** modal *"+ Nueva persona"*.

---

## 6. Integraciones clave

### a) Botón "→ Consolidar" en Asistencia

En el check-in (`AsistenciaModule`), cada **visitante** tiene un botón
**"→ Consolidar"** que llama a `consolidarDesdeAsistencia(asistencia.id)` y lo
pasa al pipeline con `origen='asistencia'`, precargando el nombre. Idempotente:
volver a tocarlo no duplica.

### b) Papelera de Reciclaje (soft-delete)

`consolidacion` usa `eliminado_at` y está en la **allowlist** de la Papelera
(6º tipo, *"Consolidación"*). Eliminar una persona la envía a la Papelera, desde
donde admin/pastor puede **restaurarla** y admin puede **purgarla**. Ver
[PAPELERA.md](./PAPELERA.md).

### c) `fn_servidores()` para el selector de responsable

La RLS de `perfiles` es *self-read* (cada quien ve el suyo; admin/pastor ven
todos), así que un `lider`/`secretaria` **no** puede listar perfiles para asignar
responsable. La función `fn_servidores()` (`SECURITY DEFINER`,
`supabase/consolidacion-servidores-rpc.sql`) expone **solo `id + nombre + correo
+ rol`** de los usuarios **activos** del panel, y solo al equipo de
consolidación. El módulo la consume vía `supabase.rpc("fn_servidores")`. Es el
mismo patrón de `directorio_miembros()`.

### d) Registro Pastoral (Miembros)

`convertirEnMiembro()` crea la ficha en `miembros_iglesia` y la vincula por
`miembro_id`, cerrando el ciclo visitante → miembro.

---

## 7. Salud pastoral: alertas de riesgo y métricas (Fase 3)

Toda la lógica de salud es **pura y determinista** (sin React ni Supabase) y vive
en `consolidacion-metricas.ts`, probada en `consolidacion-metricas.test.ts`.
Recibe `ahoraMs` como parámetro (no lee el reloj) para poder testearse.

### Días sin actividad y umbral de riesgo

- **Actividad** de una persona = la fecha **más reciente** entre: su **última
  nota**, su **creación** (`creado_at`) y su **fecha de recepción**. Como las
  notas siempre son posteriores a la creación, el máximo captura el último
  contacto real.
- `diasSinActividad(item, últimaNotaISO, ahoraMs)` = días enteros transcurridos
  desde esa actividad (`floor`); 0 si no hay fecha base.
- **En riesgo / estancado** (`enRiesgo`) = la persona sigue en un estado de
  **seguimiento** (`recibido` o `contactado`) **y** `diasSinActividad > 7`
  (constante `DIAS_RIESGO = 7`). Los estados `en_proceso`, `integrado` y
  `no_continua` nunca se marcan en riesgo.
- El **umbral es estricto**: a los 7 días exactos todavía **no** está en riesgo;
  a partir del día 8 sí.

La **última nota por persona** se obtiene con una sola query agregada
(`consolidacion_notas` ordenada por fecha desc, tomando la primera por id) al
cargar el módulo — sin columnas nuevas ni SQL adicional. El **reloj se captura
una vez al cargar** (`ahoraMs` en estado) para no llamar funciones impuras en el
render.

### UI de atención prioritaria

- **Tag "⚠ En riesgo"** + borde/anillo rojo en la card Kanban de cada estancado.
- **KPI "Requiere atención"** (se pinta rojo cuando hay casos).
- **Filtro "Requiere atención"**: deja en el tablero solo los estancados.

### Vista de Métricas (`metricasSalud`)

Un switch **Tablero ↔ Métricas** en la cabecera muestra:

- **Embudo de conversión:** conteo por etapa (Recibido → Integrado) y **% de
  conversión** = `integrados / totalPipeline`, donde `totalPipeline` excluye los
  descartados (`no_continua`).
- **Tiempo promedio de integración (aprox.):** promedio de
  `actualizado_at − creado_at` (en días) de los `integrado`.
- **Carga por responsable:** visitantes **activos** (excluye integrados y
  descartados) por líder, ordenado desc; *"Sin asignar"* destacado en ámbar.

### Badge de alerta en el sidebar

`AdminShell` muestra un **badge contador rojo** junto a *Consolidación* (y un
punto rojo cuando el sidebar está colapsado) con el número de casos en riesgo.
Para no penalizar la carga del shell, usa un **RPC escalar**
`fn_consolidacion_riesgo()` (`SECURITY DEFINER`,
`supabase/consolidacion-riesgo-rpc.sql`) que devuelve **un solo entero** calculado
en la BD con la misma regla (`recibido`/`contactado` + `>7 días` sin actividad).
Solo se consulta si el rol puede ver el módulo y **falla en silencio** (sin RPC o
sin permiso, el badge simplemente no aparece).

---

## Archivos del módulo

| Tipo | Archivos |
|---|---|
| SQL | `supabase/consolidacion.sql`, `supabase/consolidacion-servidores-rpc.sql`, `supabase/consolidacion-riesgo-rpc.sql` |
| Server Actions | `app/(admin)/admin/_components/consolidacion-actions.ts` |
| Lógica pura (métricas/riesgo) | `app/(admin)/admin/_components/consolidacion-metricas.ts` |
| UI | `app/(admin)/admin/_components/ConsolidacionModule.tsx` |
| Integración | `app/(admin)/admin/_components/AsistenciaModule.tsx` (botón "→ Consolidar"), `papelera-actions.ts` (allowlist) |
| Navegación / RBAC / Badge | `app/(admin)/admin/_components/AdminShell.tsx`, `types.ts` |
| Tests | `tests/unit/consolidacion-actions.test.ts`, `tests/unit/consolidacion-metricas.test.ts` |
| Compartidos | `mi_rol()`, `fn_audit_log_trigger()`, `fn_servidores()`, `fn_consolidacion_riesgo()`, patrón `eliminado_at` |
