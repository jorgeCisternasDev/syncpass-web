import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Eventos from './Eventos'
import { jsonResponse, renderWithAuth } from '../test/helpers'

const PROYECTO = {
  proyectoId: 1,
  titulo: 'Proyecto Demo',
  descripcion: 'Descripción ficticia',
  areaTematica: 'Medio ambiente',
  unidadVecinal: 'Villa Ficticia',
  fechaInicio: 1_790_000_000_000,
  fechaTermino: 1_800_000_000_000,
  estado: 'EN_CURSO',
}

const EVENTO = {
  eventoId: 10,
  proyectoId: 1,
  nombre: 'Evento Demo',
  fechaHora: 1_795_000_000_000,
  cuposMax: 20,
  recinto: 'Sede Ficticia',
  latitud: -33.05,
  longitud: -71.61,
  radioMetros: 100,
}

describe('Eventos', () => {
  it('muestra estado vacío cuando no hay proyectos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: [] })))

    renderWithAuth(<Eventos />, { roles: ['Coordinador'] })

    expect(
      await screen.findByText('Cree un proyecto antes de registrar eventos.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Sin proyectos')).toBeInTheDocument()
  })

  it('Coordinador ve el evento y sus acciones', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.endsWith('/proyectos')) {
          return Promise.resolve(jsonResponse({ data: [PROYECTO] }))
        }
        if (url.includes('/proyectos/1/eventos')) {
          return Promise.resolve(jsonResponse({ data: [EVENTO] }))
        }
        return Promise.resolve(jsonResponse({ message: 'Ruta inesperada' }, 404))
      }),
    )

    renderWithAuth(<Eventos />, { roles: ['Coordinador'] })

    expect(await screen.findByText('Evento Demo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nuevo evento' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })
})
