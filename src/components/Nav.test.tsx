import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import Nav from './Nav'
import { renderWithAuth } from '../test/helpers'

describe('Nav', () => {
  it('Coordinador ve el acceso a Usuarios', () => {
    renderWithAuth(<Nav />, { roles: ['Coordinador'] })

    expect(screen.getByRole('button', { name: 'Usuarios' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Proyectos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eventos' })).toBeInTheDocument()
  })

  it('Monitor no ve el acceso a Usuarios', () => {
    renderWithAuth(<Nav />, { roles: ['Monitor'] })

    expect(screen.queryByRole('button', { name: 'Usuarios' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inicio' })).toBeInTheDocument()
  })
})
