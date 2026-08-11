# Módulo de Cuidado Pastoral (Cumpleaños y Aniversarios)

Ayuda al liderazgo a **no dejar pasar a nadie**: lista los **cumpleaños** y los
**aniversarios de bautismo** de la congregación (del día, de la semana y del
mes) sobre las fichas de `miembros_iglesia`, con **felicitación directa por
WhatsApp** en un clic. Uso interno del panel.

---

## 1. Arquitectura

Dos piezas: un **motor de fechas puro** (sin React ni Supabase, testeable) y la
**UI** que lo consume leyendo las fichas.

### Motor determinista — `cuidado-pastoral.ts`

Toda la lógica de fechas vive aquí y se prueba con Vitest
(`tests/unit/cuidado-pastoral.test.ts`). Recibe `hoyMs` como parámetro **en vez
de leer el reloj**, y calcula **todo en UTC** para ser determinista e
independiente de la zona horaria del navegador.

- **`calcularOcasion(fechaISO, hoyMs): Ocasion | null`** — dada una fecha
  `YYYY-MM-DD`, calcula la **próxima ocurrencia ignorando el año**:
  - `dias`: días hasta el próximo aniversario (**0 = hoy**).
  - `anios`: los años que se cumplen en esa fecha (edad / años de bautizado/a).
  - `mesActual`: si el aniversario cae en el **mes calendario** actual.
  - Devuelve `null` si la fecha es nula o inválida.
  - **Soporte de fin de año:** si hoy es 30-dic y el cumpleaños es 2-ene, el
    resultado es `dias = 3` (rueda al año siguiente), no un número negativo.
- **`enRango(ocasion, rango): boolean`** — clasifica en:
  - `hoy` → `dias === 0`
  - `semana` → `dias` entre 0 y 7 (incluye hoy)
  - `mes` → `mesActual` (todo el mes calendario, aunque ya haya pasado)
- **`etiquetaProximo(dias)`** — texto legible: *¡Hoy!* · *Mañana* · *en N días*.

> Detalle UTC: las fechas se comparan a medianoche UTC (`Date.UTC(...)`), por lo
> que el cálculo no se corre por husos horarios ni horario de verano. El 29-feb
> en años no bisiestos rueda naturalmente al 1-mar (comportamiento aceptado).

### UI — `CuidadoModule.tsx`

Componente cliente que:

1. Carga las fichas activas (`miembros_iglesia`, `eliminado_at is null`) con el
   cliente de navegador (`getDb()`, respeta RLS) leyendo solo
   `id, nombre_completo, telefono, fecha_nacimiento, fecha_bautismo`.
2. **Captura el reloj una vez al cargar** (`ahoraMs` en estado) para no llamar
   funciones impuras en el render (exigido por el linter de React).
3. Para el tipo activo (**🎂 Cumpleaños** o **🕊️ Bautismos**) calcula la ocasión
   de cada persona, filtra por el rango elegido y **ordena por proximidad**.
4. Muestra contadores por rango (Hoy / Esta semana / Este mes) y, por persona,
   *"cumple N años"* + badge de cuándo + botón **Felicitar**.

---

## 2. Integración con WhatsApp (`wa.ts`)

El botón **💬 Felicitar** reutiliza íntegramente el **motor de comunicaciones**
de la Fase 1 (ver [COMUNICACIONES] más abajo):

- Elige la plantilla según el tipo: **`cumpleanos`** para cumpleaños o
  **`aniversario_bautismo`** para bautismos (ambas del catálogo `PLANTILLAS_WA`).
- Renderiza el mensaje con `renderPlantilla(...)` inyectando `{nombre}` (primer
  nombre, para un saludo cálido) y `{ministerio}`.
- Sanea el teléfono con `normalizarTelefono` (+56 Chile por defecto) y arma el
  enlace con `construirWaLink` → abre `https://wa.me/<num>?text=<mensaje>`.
- Si la persona no tiene un teléfono válido, el botón se **deshabilita** con un
  aviso; no se rompe nada.

A diferencia de Consolidación, aquí **no** se registra nota automática (las
fichas no tienen timeline pastoral): es una felicitación puntual.

---

## 3. Campo `fecha_bautismo` y badges en Fichas

### Nueva columna

Los aniversarios de bautismo requieren una fecha propia (distinta de
`fecha_ingreso`, que es el ingreso a la iglesia). Se agregó:

```sql
alter table public.miembros_iglesia
  add column if not exists fecha_bautismo date;
```

(`supabase/miembros-fecha-bautismo.sql`, seguro de re-ejecutar). El campo se
integró en la ficha de miembro de punta a punta: **formulario** (input date con
hint *"Para aniversarios"*), **Server Actions** (`MiembroInput`, `COLS`,
`normalizar`) y **PDF** de la ficha.

### Indicadores visuales en la lista de fichas

En `MiembrosModule`, cada fila calcula la ocasión con el mismo motor y muestra un
**badge** cuando el cumpleaños o el bautismo está a **≤ 7 días**:

- 🎂 rosado — *Cumpleaños ¡Hoy! / Mañana / en N días*
- 🕊️ celeste — *Aniversario de bautismo …*

Así el liderazgo ve las fechas próximas sin salir del registro pastoral. (El
reloj también se captura al cargar para evitar impureza en el render.)

---

## 4. Seguridad y RBAC

El módulo lee `miembros_iglesia`, una tabla de **datos sensibles**. El acceso se
alinea **exactamente con su RLS**:

| | admin | pastor | secretaria | lider | resto |
|---|:---:|:---:|:---:|:---:|:---:|
| Ver Cuidado Pastoral | ✅ | ✅ | ✅ | ❌ | ❌ |

- Acceso en `AdminShell`: grupo *Pastoral*, `ACCESO_EXTRA.cuidado =
  ["secretaria"]` + acceso total de admin/pastor. **`lider` no accede**, porque
  la RLS de `miembros_iglesia` (`mi_rol() in ('admin','pastor','secretaria')`)
  no le permite leer las fichas: el módulo simplemente no le sirve.
- La barrera real es la **RLS**; el filtrado del menú es defensa en UI.
- No hay endpoints nuevos ni datos expuestos: la felicitación se arma en el
  cliente y abre WhatsApp; no se envía nada a terceros desde el servidor.

---

## 5. Pruebas

`tests/unit/cuidado-pastoral.test.ts` (9 casos, reloj fijo por `Date.UTC`):
cumpleaños hoy (días 0 + años + mesActual), a N días, ya pasado este año
(próximo el año siguiente, mismo mes), **cruce de fin de año**, fechas
inválidas/ausentes, los límites de `enRango` (0..7 en semana, `mesActual` en
mes) y las etiquetas de proximidad. Corren en el CI en cada push/PR.

---

## Archivos del módulo

| Tipo | Archivos |
|---|---|
| SQL | `supabase/miembros-fecha-bautismo.sql` |
| Lógica pura (fechas) | `app/(admin)/admin/_components/cuidado-pastoral.ts` |
| UI | `app/(admin)/admin/_components/CuidadoModule.tsx` |
| Integración | `app/(admin)/admin/_components/wa.ts` (plantillas/enlace), `MiembrosModule.tsx` (campo + badges), `miembros-actions.ts` |
| Navegación / RBAC | `app/(admin)/admin/_components/AdminShell.tsx`, `types.ts` |
| Tests | `tests/unit/cuidado-pastoral.test.ts` |

> **[COMUNICACIONES]** El motor `wa.ts` (`normalizarTelefono`, `construirWaLink`,
> `renderPlantilla`, catálogo `PLANTILLAS_WA`) se documenta junto a la
> integración de Consolidación; aquí se reutiliza tal cual.
