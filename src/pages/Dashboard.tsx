import { useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav'
import { useAuth } from '../auth'

interface Resumen {
  usuarios: number
  eventos: number
  asistencias: number
  encuestas: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [resumen, setResumen] = useState<Resumen | null>(null)

  useEffect(() => {
    api.resumen().then(setResumen).catch(() => setResumen(null))
  }, [])

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">SyncPass</p>
          <h1>Hola, {user?.nombre || user?.email}</h1>
        </div>
        <Nav />
      </header>

      <section className="grid">
        <article className="card">
          <p className="eyebrow">Rol activo</p>
          <h2>{user?.roles?.join(' · ') || 'Sin rol'}</h2>
          <p className="muted">
            El rol viaja en el JWT y el backend lo valida en cada endpoint protegido.
          </p>
        </article>

        <article className="card">
          <p className="eyebrow">Asistencias</p>
          <h2>{resumen ? resumen.asistencias : '—'}</h2>
          <p className="muted">
            Recibidas desde la app móvil en <code>/api/sync/lote</code>, sin duplicados.
          </p>
        </article>

        <article className="card">
          <p className="eyebrow">Encuestas</p>
          <h2>{resumen ? resumen.encuestas : '—'}</h2>
          <p className="muted">Una respuesta por evento y usuario.</p>
        </article>

        <article className="card">
          <p className="eyebrow">Eventos</p>
          <h2>{resumen ? resumen.eventos : '—'}</h2>
          <p className="muted">{resumen ? `${resumen.usuarios} usuarios registrados` : 'Cargando…'}</p>
        </article>
      </section>
    </main>
  )
}
