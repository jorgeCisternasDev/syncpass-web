import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Proyectos from './Proyectos'
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

describe('Proyectos', () => {
  it('Coordinador ve formulario y estado vacío', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: [] })))

    renderWithAuth(<Proyectos />, { roles: ['Coordinador'] })

    expect(await screen.findByText('Todavía no hay proyectos.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nuevo proyecto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear proyecto' })).toBeInTheDocument()
  })

  it('Coordinador ve acciones sobre un proyecto existente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ data: [PROYECTO] })),
    )

    renderWithAuth(<Proyectos />, { roles: ['Coordinador'] })

    expect(await screen.findByText('Proyecto Demo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  it('Monitor no ve formulario ni acciones de escritura', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ data: [PROYECTO] })),
    )

    renderWithAuth(<Proyectos />, { roles: ['Monitor'] })

    expect(
      await screen.findByText(
        'Solo el rol Coordinador puede crear, editar o eliminar proyectos.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Nuevo proyecto' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  it('muestra el error cuando la API falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ message: 'No se pudo cargar el catálogo' }, 500),
      ),
    )

    renderWithAuth(<Proyectos />, { roles: ['Coordinador'] })

    expect(await screen.findByText('No se pudo cargar el catálogo')).toBeInTheDocument()
  })
})
