# SyncPass Web

Panel de coordinaci?n del caso CITT SyncPass: login, dashboard, usuarios y cat?logo.
Consume `syncpass-api`.

## Stack

React 19 · TypeScript · Vite 8 · wouter (routing) · CSS propio.

## Correr

```powershell
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + build de producción
```

La URL de la API sale de `VITE_API_URL` (por defecto `http://localhost:8080/api`).

## Variables de entorno

`VITE_API_URL` incluye la ruta `/api` y se lee en tiempo de build.

- Desarrollo: copiar `.env.example` a `.env.local` y usar `http://localhost:8080/api`.
- Build de producción: copiar `.env.production.example` a `.env.production`, cambiar la URL y ejecutar `npm run build`.
- No se versionan secretos. La URL de la API no es un secreto, pero debe ser la del entorno correcto.

## Rutas

| Ruta | Acceso | Contenido |
| --- | --- | --- |
| `/login` | público | Formulario de acceso |
| `/` | autenticado | Dashboard con rol, asistencias, encuestas y eventos |
| `/usuarios` | `Coordinador` | Alta, baja, reactivación y eliminación de usuarios |
| `/proyectos` | autenticado | Lista, crea, edita y elimina proyectos; solo Coordinador escribe |
| `/eventos` | autenticado | Lista, crea, edita y elimina eventos por proyecto; solo Coordinador escribe |

El guard del front solo oculta UI: la autorización real la valida el backend con el JWT.

## Flujo de sesión

1. `POST /api/auth/login` → tokens.
2. `accessToken` en `localStorage` y `Authorization: Bearer` en cada request.
3. El rol se decodifica del JWT (`roles` o `cognito:groups`).

Cuentas demo: `coordinador@syncpass.cl / Coord.2026` · `monitor@syncpass.cl / Monitor.2026` ·
`asistente@syncpass.cl / Asist.2026`.
