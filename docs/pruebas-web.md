# Pruebas y cobertura — panel web

## Suites

```powershell
npm test
npm run build
npm run test:coverage
```

| Comando | Resultado |
| --- | --- |
| `npm test` | **22 pruebas, 0 fallos** (8 archivos) |
| `npm run build` | `tsc --noEmit` + Vite OK |
| `npm run test:coverage` | **51 % de líneas**, umbral 30 % |

## Cobertura

| Métrica | Cubierto / total | Porcentaje |
| --- | --- | --- |
| Sentencias | 188 / 373 | **50,4 %** |
| Ramas | 114 / 243 | **46,91 %** |
| Funciones | 53 / 131 | **40,45 %** |
| Líneas | 178 / 349 | **51 %** |

Umbral de 30 % configurado en `vitest.config.ts`; la corrida pasa.

| Archivo | Líneas |
| --- | --- |
| `Login.tsx` | 88,2 % |
| `Dashboard.tsx` | 100 % |
| `auth.tsx` | 80 % |
| `api.ts` | 64,3 % |
| `Nav.tsx` | 33,3 % |
| `Proyectos.tsx` | 37,7 % |
| `Eventos.tsx` | 44,6 % |
| `Usuarios.tsx` | 50 % |
| `catalogo.ts` | 45,9 % |
| `App.tsx` | 0 % (compone rutas; se prueba vía guard) |

Reportes: `coverage/index.html` y `coverage/coverage-summary.json`. Se excluyen `src/main.tsx`, los `*.test.*` y `src/test/**`.

## Qué cubren

- Login válido, credenciales inválidas, error de servidor y estado de carga.
- Dashboard con totales y estado de carga.
- Proyectos: lista vacía, lista con datos, acciones de Coordinador y guard de Monitor.
- Usuarios: alta y lista para Coordinador; sin alta para Monitor.
- Eventos: sin proyectos, lista y acciones.
- Menú por rol y validaciones de catálogo.

## Límites

- No hay end-to-end de navegador (Playwright/Cypress).
- No se mide cobertura de la API ni de la app; el consolidado está en el repo de la API.
- `npm install` reporta 7 vulnerabilidades altas de desarrollo; no se aplicó `audit fix --force`.

Consolidado: [pruebas-cobertura.md](https://github.com/jorgeCisternasDev/syncpass-api/blob/main/docs/pruebas-cobertura.md).
