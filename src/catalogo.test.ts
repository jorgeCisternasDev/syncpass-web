import { describe, expect, it } from 'vitest'
import {
  formAEvento,
  formAProyecto,
  guardarProyecto,
  puedeEditarCatalogo,
  proyectoVacio,
} from './catalogo'

describe('catálogo', () => {
  it('solo permite escribir al rol Coordinador', () => {
    expect(puedeEditarCatalogo(['Coordinador'])).toBe(true)
    expect(puedeEditarCatalogo(['Monitor', 'Asistente'])).toBe(false)
  })

  it('convierte fechas de formulario y limpia espacios', () => {
    const payload = formAProyecto({
      ...proyectoVacio,
      titulo: '  Proyecto de prueba  ',
      descripcion: '  Descripción  ',
      areaTematica: '  Pruebas  ',
      unidadVecinal: '  Unidad  ',
      fechaInicio: '2026-11-16',
      fechaTermino: '2026-11-17',
    })

    expect(payload.titulo).toBe('Proyecto de prueba')
    expect(payload.descripcion).toBe('Descripción')
    expect(payload.areaTematica).toBe('Pruebas')
    expect(payload.unidadVecinal).toBe('Unidad')
    expect(payload.fechaInicio).toBeGreaterThan(0)
    expect(payload.fechaTermino).toBeGreaterThan(payload.fechaInicio)
  })

  it('convierte coordenadas vacías a null', () => {
    const payload = formAEvento({
      proyectoId: '1',
      nombre: '  Evento  ',
      fechaHora: '2026-11-16T10:30',
      cuposMax: '25',
      recinto: '  Sede  ',
      latitud: '',
      longitud: '',
      radioMetros: '100',
    })

    expect(payload.nombre).toBe('Evento')
    expect(payload.recinto).toBe('Sede')
    expect(payload.cuposMax).toBe(25)
    expect(payload.radioMetros).toBe(100)
    expect(payload.latitud).toBeNull()
    expect(payload.longitud).toBeNull()
  })

  it('rechaza un proyecto incompleto antes de llamar a la API', async () => {
    await expect(guardarProyecto(null, proyectoVacio)).rejects.toThrow('El título es obligatorio')
  })
})
