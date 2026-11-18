import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Usuarios from './Usuarios'
import { jsonResponse, renderWithAuth } from '../test/helpers'

const USUARIO = {
  id: '1',
  email: 'ana@syncpass.cl',
  nombre: 'Ana Ficticia',
  roles: ['Coordinador'],
  activo: true,
}

describe('Usuarios', () => {
  it('Coordinador ve el alta y la lista de usuarios', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ data: [USUARIO] })),
    )

    renderWithAuth(<Usuarios />, { roles: ['Coordinador'] })

    expect(await screen.findByText('Ana Ficticia')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Alta de usuario' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear usuario' })).toBeInTheDocument()
  })

  it('Monitor no ve el formulario de alta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: [] })))

    renderWithAuth(<Usuarios />, { roles: ['Monitor'] })

    expect(
      await screen.findByText('Solo el rol Coordinador puede administrar usuarios.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Crear usuario' })).not.toBeInTheDocument()
  })
})
