import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../auth'

export default function Login() {
  const { login } = useAuth()
  const [, navigate] = useLocation()
  const [email, setEmail] = useState('coordinador@syncpass.cl')
  const [password, setPassword] = useState('Coord.2026')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="card auth-card">
        <header>
          <p className="eyebrow">CITT · Acreditación de talleres</p>
          <h1>SyncPass</h1>
          <p className="muted">Panel de coordinación de proyectos, eventos y asistencia.</p>
        </header>

        <form onSubmit={onSubmit} className="stack">
          <label>
            Correo
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <footer className="muted small">
          Demo local: coordinador@syncpass.cl / Coord.2026 · monitor@syncpass.cl / Monitor.2026 ·
          asistente@syncpass.cl / Asist.2026
        </footer>
      </section>
    </main>
  )
}
