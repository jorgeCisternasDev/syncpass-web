import type { ReactNode } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { useAuth } from './auth'
import Dashboard from './pages/Dashboard'
import Eventos from './pages/Eventos'
import Login from './pages/Login'
import Proyectos from './pages/Proyectos'
import Usuarios from './pages/Usuarios'

function Guard({ children, role }: { children: ReactNode; role?: string }) {
  const { user, hasRole } = useAuth()

  if (!user) {
    return <Redirect to="/login" />
  }

  if (role && !hasRole(role)) {
    return <Redirect to="/" />
  }

  return <>{children}</>
}

function Redirect({ to }: { to: string }) {
  const [, navigate] = useLocation()
  navigate(to, { replace: true })
  return null
}

export default function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <Guard>
          <Dashboard />
        </Guard>
      </Route>
      <Route path="/usuarios">
        <Guard role="Coordinador">
          <Usuarios />
        </Guard>
      </Route>
      <Route path="/proyectos">
        <Guard>
          <Proyectos />
        </Guard>
      </Route>
      <Route path="/eventos">
        <Guard>
          <Eventos />
        </Guard>
      </Route>
      <Route>
        <p>Ruta no encontrada</p>
      </Route>
    </Switch>
  )
}
