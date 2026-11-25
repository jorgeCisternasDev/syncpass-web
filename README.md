# SyncPass Web

Panel de coordinación del caso CITT SyncPass: login, dashboard, usuarios y catálogo.
Consume `syncpass-api`.

## Sistema en línea (entrega 2026-11-24)

| Pieza | URL o repositorio |
| --- | --- |
| Panel + API | <https://syncpass-production.up.railway.app> |
| API | <https://syncpass-production.up.railway.app/api/health> |
| App Android | [syncpass-mvp](https://github.com/jorgeCisternasDev/syncpass-mvp) |
| Backend | [syncpass-api](https://github.com/jorgeCisternasDev/syncpass-api) |

En producción el panel se sirve desde el mismo Spring Boot que la API; el build usa
`VITE_API_URL=/api` y las peticiones quedan en el mismo origen.

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
- Build de producción: copiar `.env.production.example` a `.env.production` y usar
  `VITE_API_URL=https://syncpass-production.up.railway.app/api`, o `VITE_API_URL=/api` si el panel
  se sirve desde el mismo Spring Boot.
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

## Pruebas y cobertura

```powershell
npm test
npm run build
npm run test:coverage
```

- **20 pruebas, 0 fallos** (7 archivos).
- **50,29 % de líneas** (172/342), umbral 30 % en `vitest.config.ts`.
- Reporte HTML: `coverage/index.html`.

Detalle: [docs/pruebas-web.md](docs/pruebas-web.md).

## Documentación

- [Arquitectura del panel](docs/arquitectura-web.md)
- [Vistas y navegación](docs/vistas-web.md)
- [Demo del panel](docs/demo-web.md)
- [Pruebas y cobertura](docs/pruebas-web.md)
- [Arquitectura y contrato del sistema](https://github.com/jorgeCisternasDev/syncpass-api/tree/main/docs)
