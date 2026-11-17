import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import type { Usuario } from '../api'
import { useAuth } from '../auth'
import Nav from '../components/Nav'

const ROLES = ['Coordinador', 'Monitor', 'Asistente']

export default function Usuarios() {
  const { hasRole } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('Asistente')

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setUsuarios(await api.usuarios())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la lista')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function accion(mensaje: string, fn: () => Promise<unknown>) {
    setFeedback(null)
    setError(null)
    try {
      await fn()
      setFeedback(mensaje)
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La operación falló')
    }
  }

  async function onCrear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await accion('Usuario creado', async () => {
      await api.registrar({ email: email.trim(), password, nombre: nombre.trim(), roles: [rol] })
      setEmail('')
      setNombre('')
      setPassword('')
    })
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Usuarios</h1>
        </div>
        <Nav />
      </header>

      {error && <p className="error">{error}</p>}
      {feedback && <p className="ok">{feedback}</p>}

      <section className="card">
        <h2>Alta de usuario</h2>
        {hasRole('Coordinador') ? (
          <form className="form-grid" onSubmit={onCrear}>
            <label>
              Nombre
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </label>
            <label>
              Rol
              <select value={rol} onChange={(e) => setRol(e.target.value)}>
                {ROLES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Crear usuario</button>
          </form>
        ) : (
          <p className="muted">Solo el rol Coordinador puede administrar usuarios.</p>
        )}
      </section>

      <section className="card">
        <h2>Usuarios registrados</h2>
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Roles</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.roles.join(', ')}</td>
                  <td>{usuario.activo ? 'Activo' : 'De baja'}</td>
                  <td className="row">
                    <button
                      className="ghost small"
                      onClick={() =>
                        accion(usuario.activo ? 'Usuario dado de baja' : 'Usuario reactivado', () =>
                          usuario.activo ? api.darDeBaja(usuario.id) : api.darDeAlta(usuario.id),
                        )
                      }
                    >
                      {usuario.activo ? 'Dar de baja' : 'Reactivar'}
                    </button>
                    <button
                      className="ghost small danger"
                      onClick={() => accion('Usuario eliminado', () => api.eliminar(usuario.id))}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}
