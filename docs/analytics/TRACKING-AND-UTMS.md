# Tracking interno y convención de UTMs

Guía para el equipo de comunicación: cómo funciona la analítica del sitio y
cómo compartir enlaces para que el panel de **Impacto** atribuya bien el origen.

---

## 1. Cómo funciona el tracking (resumen técnico)

El sitio usa **analítica de primera parte** (propia), privada y sin cookies de
terceros. No se guarda IP ni datos personales.

| Pieza | Rol |
|---|---|
| `PageTracker.tsx` | Registra cada vista de página y el tiempo de permanencia. |
| `track.ts` / `TrackLink.tsx` | Registran eventos de interacción (clics). |
| `/api/track` | Endpoint que recibe y guarda vistas/eventos (enriquece con país/ciudad desde Vercel). |
| RPC `fn_get_impacto_stats` | Agrega todo en la BD para el panel de Impacto. |
| **Vercel Web Analytics + Speed Insights** | Rendimiento y **Core Web Vitals** (LCP/INP/CLS) en el dashboard de Vercel. |

### Eventos que se registran
`page_view` (con `duration`), `visit_plan_click`, `testimonio_play`, `share`,
`social_click`, `contact_click`, `event_interest`, `event_gallery_open`.

### Garantías de calidad de los datos
- **Filtro de bots:** `/api/track` descarta por `User-Agent` a Googlebot,
  Bingbot, Yandex, Baidu, DuckDuckBot, previews de WhatsApp/Facebook, headless,
  monitores, etc. → las "visitas" son de personas reales.
- **Atribución por sesión (no por página):** el origen (referrer/UTM) se envía
  **solo en la primera vista** de la sesión y se cuenta **una vez por sesión**.
  Un visitante que ve 8 páginas cuenta como **1** en "Origen del tráfico".
- **Sin auto-referencias:** si el referrer es el propio dominio (`ccmieles.cl`),
  se ignora.
- **Duración fiable:** el tiempo de permanencia se envía con `navigator.sendBeacon`
  al ocultar/cerrar la pestaña o navegar → se captura incluso en salidas y rebotes.
- **Serie diaria en hora de Chile** (`America/Santiago`).

> Nota: "personas alcanzadas" cuenta **sesiones únicas** (por pestaña), no
> personas físicas únicas. Es una buena aproximación de alcance.

---

## 2. Convención de UTMs (para el equipo de comunicación)

Cuando compartas un enlace del sitio, **agrégale parámetros UTM** para que el
panel sepa de dónde vino la visita. Sin UTM, el tráfico de apps (WhatsApp,
Instagram) suele caer en "Directo" porque no envían referrer.

### Parámetros
| Parámetro | Qué es | Valores sugeridos |
|---|---|---|
| `utm_source` | **De dónde** viene | `whatsapp`, `facebook`, `instagram`, `youtube`, `tiktok` |
| `utm_medium` | **Cómo** se compartió | `grupo`, `estado`, `historia`, `post`, `bio`, `mensaje` |
| `utm_campaign` | **Qué** campaña/objetivo | `invitacion`, `evento-aniversario`, `culto-dominical`, `oracion` |

> El panel prioriza `utm_source` sobre el referrer. Usa **minúsculas y sin
> espacios** (usa guiones: `evento-aniversario`).

### Plantilla
```
https://ccmieles.cl/?utm_source=FUENTE&utm_medium=MEDIO&utm_campaign=CAMPAÑA
```
Para enlazar una página específica, se agrega **después** de la ruta:
```
https://ccmieles.cl/eventos?utm_source=whatsapp&utm_medium=grupo&utm_campaign=aniversario
```

### Ejemplos listos para copiar
| Canal | Enlace |
|---|---|
| WhatsApp (grupo) | `https://ccmieles.cl/?utm_source=whatsapp&utm_medium=grupo&utm_campaign=invitacion` |
| WhatsApp (estado) | `https://ccmieles.cl/?utm_source=whatsapp&utm_medium=estado&utm_campaign=culto-dominical` |
| Facebook (post) | `https://ccmieles.cl/eventos?utm_source=facebook&utm_medium=post&utm_campaign=aniversario` |
| Instagram (historia) | `https://ccmieles.cl/?utm_source=instagram&utm_medium=historia&utm_campaign=invitacion` |
| Instagram (bio) | `https://ccmieles.cl/?utm_source=instagram&utm_medium=bio&utm_campaign=general` |

### Buenas prácticas
- Usa siempre `utm_source` como mínimo; `medium` y `campaign` son opcionales pero
  recomendables.
- Acorta el enlace resultante con un acortador si te queda largo para WhatsApp
  (la mayoría conserva los parámetros).
- Mantén nombres consistentes (siempre `whatsapp`, no a veces `WhatsApp` o `wsp`).

---

## 3. Dónde ver los resultados
- **Panel → Impacto del Ministerio:** origen del tráfico (con UTMs), dispositivos,
  ciudades, ministerios con más interés, tendencia y el índice de impacto.
- **Vercel → Analytics / Speed Insights:** visitas globales y Core Web Vitals.
- **Google Search Console:** búsquedas, impresiones y posición en Google.
