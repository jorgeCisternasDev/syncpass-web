import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, clearTokens, decodeSession, getToken, setTokens } from './api'
import type { SessionUser } from './api'

interface AuthContextValue {
  user: SessionUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readUser(): SessionUser | null {
  const token = getToken()
  return token ? decodeSession(token) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readUser())

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await api.login(email, password)
    setTokens(tokens)
    setUser(decodeSession(tokens.accessToken))
  }, [])

  const logout = useCallback(async () => {
    await api.logout()
    clearTokens()
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (role: string) => Boolean(user?.roles?.includes(role)),
    [user],
  )

  const value = useMemo(() => ({ user, login, logout, hasRole }), [user, login, logout, hasRole])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
