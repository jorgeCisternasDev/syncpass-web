import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Router } from 'wouter'
import { AuthProvider } from '../auth'

export function makeToken(payload: Record<string, unknown>): string {
  return `header.${btoa(JSON.stringify(payload))}.signature`
}

export function setSession(
  roles: string[],
  nombre = 'Camila Rojas',
  email = 'coordinador@syncpass.cl',
): void {
  localStorage.setItem(
    'syncpass_token',
    makeToken({ sub: '1', email, nombre, roles }),
  )
}

export function renderWithAuth(
  ui: ReactElement,
  options: {
    roles?: string[]
    session?: boolean
    nombre?: string
    email?: string
  } = {},
) {
  if (options.session !== false) {
    setSession(
      options.roles ?? ['Coordinador'],
      options.nombre ?? 'Camila Rojas',
      options.email ?? 'coordinador@syncpass.cl',
    )
  }

  return render(
    <AuthProvider>
      <Router>{ui}</Router>
    </AuthProvider>,
  )
}

export function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response
}
