import { useLocation } from 'wouter'
import { useAuth } from '../auth'

export default function Nav() {
  const { hasRole, logout } = useAuth()
  const [, navigate] = useLocation()

  async function salir() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="row" aria-label="Navegación principal">
      <button className="ghost" onClick={() => navigate('/')}>
        Inicio
      </button>
      <button className="ghost" onClick={() => navigate('/proyectos')}>
        Proyectos
      </button>
      <button className="ghost" onClick={() => navigate('/eventos')}>
        Eventos
      </button>
      {hasRole('Coordinador') && (
        <button className="ghost" onClick={() => navigate('/usuarios')}>
          Usuarios
        </button>
      )}
      <button className="ghost" onClick={salir}>
        Salir
      </button>
    </nav>
  )
}
