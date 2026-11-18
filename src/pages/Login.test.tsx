import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './Login'
import { jsonResponse, makeToken, renderWithAuth } from '../test/helpers'

const TOKEN = makeToken({
  sub: '1',
  email: 'coordinador@syncpass.cl',
  nombre: 'Camila Rojas',
  roles: ['Coordinador'],
})

describe('Login', () => {
  it('login válido guarda accessToken y refreshToken', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        accessToken: TOKEN,
        idToken: TOKEN,
        refreshToken: 'refresh-ficticio',
        expiresIn: 3600,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderWithAuth(<Login />, { session: false })
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => {
      expect(localStorage.getItem('syncpass_token')).toBe(TOKEN)
    })
    expect(localStorage.getItem('syncpass_refresh')).toBe('refresh-ficticio')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('credenciales inválidas muestran el mensaje del servidor y no guardan token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ message: 'Credenciales inválidas' }, 401),
      ),
    )

    renderWithAuth(<Login />, { session: false })
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
    expect(localStorage.getItem('syncpass_token')).toBeNull()
  })

  it('error del servidor se muestra sin romper el formulario', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ message: 'Servidor no disponible' }, 500),
      ),
    )

    renderWithAuth(<Login />, { session: false })
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Servidor no disponible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled()
  })

  it('muestra estado de carga y deshabilita el botón mientras espera', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})))

    renderWithAuth(<Login />, { session: false })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Ingresando')
    })
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
