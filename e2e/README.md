# Pruebas E2E (Playwright)

Estos flujos validan la seguridad crítica contra una app **real** corriendo, por
lo que necesitan **usuarios de prueba sembrados en Supabase** y la app levantada.
Se auto-omiten (`test.skip`) si faltan las variables de entorno.

## 1. Preparar usuarios de prueba (una vez, en Supabase)

En **Authentication → Users** crea dos usuarios con contraseña:

| Propósito | Perfil requerido |
|---|---|
| Kill-switch | `perfiles.activo = false` |
| Gating RBAC | `perfiles.rol = 'tesorero'` y `activo = true` |

> Ajusta `perfiles` en el SQL Editor tras crearlos, p. ej.:
> `update public.perfiles set activo = false where correo = 'inactivo@ejemplo.cl';`
> `update public.perfiles set rol = 'tesorero', activo = true where correo = 'tesorero@ejemplo.cl';`

## 2. Variables de entorno

```bash
export E2E_BASE_URL="http://localhost:3000"          # opcional
export E2E_INACTIVO_EMAIL="inactivo@ejemplo.cl"
export E2E_INACTIVO_PASSWORD="********"
export E2E_TESORERO_EMAIL="tesorero@ejemplo.cl"
export E2E_TESORERO_PASSWORD="********"
```

## 3. Ejecutar

```bash
npx playwright install chromium   # una vez: descarga el navegador
npm run build && npm start        # levanta la app en :3000 (otra terminal)
npm run test:e2e                  # corre los flujos
```

> **Nunca** subas credenciales reales al repo. En CI, inyéctalas como secrets.
