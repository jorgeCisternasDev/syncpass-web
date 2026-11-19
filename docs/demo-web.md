# Demo del panel web

Duración: 3 a 4 minutos. La demo completa (app, sync, cámara) está en el repo de la API:
[guion completo](https://github.com/jorgeCisternasDev/syncpass-api/blob/main/docs/demo.md).

## Antes de partir

```powershell
# API
cd syncpass-api
$env:JWT_SECRET = "<clave de 32+ bytes>"
.\gradlew.bat bootRun

# Panel
cd syncpass-web
npm install
Copy-Item .env.example .env.local   # VITE_API_URL=http://localhost:8080/api
npm run dev
```

Credenciales: `coordinador@syncpass.cl / Coord.2026`, `monitor@syncpass.cl / Monitor.2026`.

## Guion

1. **Login Monitor.** Entrar con `monitor@syncpass.cl`; el dashboard saluda con el nombre y rol Monitor.
2. **Guard por rol.** El menú no muestra Usuarios; en `/proyectos` no aparecen crear, editar ni eliminar.
3. **Catálogo.** Mostrar proyectos y eventos; si la API tiene el evento **Demo Defensa**, aparece en la lista.
4. **403 real.** Con el token del Monitor, intentar crear un proyecto por consola y mostrar el 403.
5. **Login Coordinador.** Entrar con `coordinador@syncpass.cl`; ahora aparece Usuarios y los formularios.
6. **CRUD.** Crear un proyecto ficticio, editarlo y eliminarlo; mostrar que la lista se actualiza.

Comando para el 403:

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/login `
  -ContentType 'application/json' `
  -Body '{"email":"monitor@syncpass.cl","password":"Monitor.2026"}'
try {
  Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/proyectos `
    -Headers @{ Authorization = "Bearer $($login.accessToken)" } `
    -ContentType 'application/json' `
    -Body '{"titulo":"x","descripcion":"x","areaTematica":"x","unidadVecinal":"x","fechaInicio":1795000000000,"fechaTermino":1795100000000,"estado":"EN_CURSO"}'
} catch { $_.Exception.Response.StatusCode.value__ }
```

## Evidencia

- Pruebas: `npm test` (20 casos) y `npm run test:coverage` (50,29 % de líneas).
- Capturas del sistema completo: repo de la API, `docs/demo.md`.
