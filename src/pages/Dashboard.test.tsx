import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Dashboard from './Dashboard'
import { jsonResponse, renderWithAuth } from '../test/helpers'

describe('Dashboard', () => {
  it('muestra nombre, rol y totales del resumen', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          data: { usuarios: 5, eventos: 3, asistencias: 2, encuestas: 1 },
        }),
      ),
    )

    renderWithAuth(<Dashboard />, { nombre: 'Camila Rojas', roles: ['Coordinador'] })

    expect(screen.getByText('Hola, Camila Rojas')).toBeInTheDocument()
    expect(screen.getByText('Coordinador')).toBeInTheDocument()
    expect(await screen.findByText('5 usuarios registrados')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('muestra el estado de carga mientras espera el resumen', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})))

    renderWithAuth(<Dashboard />, { roles: ['Monitor'] })

    expect(screen.getByText(/Cargando/)).toBeInTheDocument()
    expect(screen.getByText('Hola, Camila Rojas')).toBeInTheDocument()
  })
})
