import { api } from './api'
import type { Evento, EventoInput, Proyecto, ProyectoInput } from './api'

export const ESTADOS_PROYECTO = ['PLANIFICADO', 'EN_CURSO', 'FINALIZADO'] as const

export interface ProyectoForm {
  titulo: string
  descripcion: string
  areaTematica: string
  unidadVecinal: string
  fechaInicio: string
  fechaTermino: string
  estado: string
}

export interface EventoForm {
  proyectoId: string
  nombre: string
  fechaHora: string
  cuposMax: string
  recinto: string
  latitud: string
  longitud: string
  radioMetros: string
}

export const proyectoVacio: ProyectoForm = {
  titulo: '',
  descripcion: '',
  areaTematica: '',
  unidadVecinal: '',
  fechaInicio: '',
  fechaTermino: '',
  estado: 'PLANIFICADO',
}

export const eventoVacio: EventoForm = {
  proyectoId: '',
  nombre: '',
  fechaHora: '',
  cuposMax: '30',
  recinto: '',
  latitud: '',
  longitud: '',
  radioMetros: '100',
}

export function puedeEditarCatalogo(roles: string[]): boolean {
  return roles.includes('Coordinador')
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function fechaAInput(ms: number): string {
  const date = new Date(ms)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fechaHoraAInput(ms: number): string {
  const date = new Date(ms)
  return `${fechaAInput(ms)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatearFecha(ms: number): string {
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(new Date(ms))
}

export function formatearFechaHora(ms: number): string {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ms))
}

export function proyectoAForm(proyecto: Proyecto): ProyectoForm {
  return {
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    areaTematica: proyecto.areaTematica,
    unidadVecinal: proyecto.unidadVecinal,
    fechaInicio: fechaAInput(proyecto.fechaInicio),
    fechaTermino: fechaAInput(proyecto.fechaTermino),
    estado: proyecto.estado,
  }
}

export function eventoAForm(evento: Evento): EventoForm {
  return {
    proyectoId: String(evento.proyectoId),
    nombre: evento.nombre,
    fechaHora: fechaHoraAInput(evento.fechaHora),
    cuposMax: String(evento.cuposMax),
    recinto: evento.recinto,
    latitud: evento.latitud == null ? '' : String(evento.latitud),
    longitud: evento.longitud == null ? '' : String(evento.longitud),
    radioMetros: String(evento.radioMetros),
  }
}

function fechaDesdeInput(value: string): number {
  return new Date(`${value}T00:00:00`).getTime()
}

function fechaHoraDesdeInput(value: string): number {
  return new Date(value).getTime()
}

export function formAProyecto(form: ProyectoForm): ProyectoInput {
  const inicio = fechaDesdeInput(form.fechaInicio)
  const termino = fechaDesdeInput(form.fechaTermino)
  return {
    titulo: form.titulo.trim(),
    descripcion: form.descripcion.trim(),
    areaTematica: form.areaTematica.trim(),
    unidadVecinal: form.unidadVecinal.trim(),
    fechaInicio: inicio,
    fechaTermino: termino,
    estado: form.estado.trim(),
  }
}

export function formAEvento(form: EventoForm): EventoInput {
  return {
    proyectoId: Number(form.proyectoId),
    nombre: form.nombre.trim(),
    fechaHora: fechaHoraDesdeInput(form.fechaHora),
    cuposMax: Number(form.cuposMax),
    recinto: form.recinto.trim(),
    latitud: form.latitud.trim() === '' ? null : Number(form.latitud),
    longitud: form.longitud.trim() === '' ? null : Number(form.longitud),
    radioMetros: Number(form.radioMetros),
  }
}

function validarProyecto(payload: ProyectoInput): string[] {
  const errores: string[] = []
  if (!payload.titulo) errores.push('El título es obligatorio')
  if (!payload.descripcion) errores.push('La descripción es obligatoria')
  if (!payload.areaTematica) errores.push('El área temática es obligatoria')
  if (!payload.unidadVecinal) errores.push('La unidad vecinal es obligatoria')
  if (!payload.estado) errores.push('El estado es obligatorio')
  if (!Number.isFinite(payload.fechaInicio)) errores.push('La fecha de inicio es obligatoria')
  if (!Number.isFinite(payload.fechaTermino)) errores.push('La fecha de término es obligatoria')
  if (
    Number.isFinite(payload.fechaInicio) &&
    Number.isFinite(payload.fechaTermino) &&
    payload.fechaTermino < payload.fechaInicio
  ) {
    errores.push('La fecha de término debe ser posterior o igual a la de inicio')
  }
  return errores
}

function validarEvento(payload: EventoInput, proyecto: Proyecto): string[] {
  const errores: string[] = []
  if (!Number.isFinite(payload.proyectoId) || payload.proyectoId <= 0) {
    errores.push('Debe seleccionar un proyecto')
  }
  if (!payload.nombre) errores.push('El nombre del evento es obligatorio')
  if (!payload.recinto) errores.push('El recinto es obligatorio')
  if (!Number.isFinite(payload.fechaHora)) errores.push('La fecha y hora son obligatorias')
  if (!Number.isInteger(payload.cuposMax) || payload.cuposMax <= 0) {
    errores.push('Los cupos deben ser un entero mayor que cero')
  }
  if (!Number.isInteger(payload.radioMetros) || payload.radioMetros <= 0) {
    errores.push('El radio debe ser un entero mayor que cero')
  }
  if (
    Number.isFinite(payload.fechaHora) &&
    (payload.fechaHora < proyecto.fechaInicio || payload.fechaHora > proyecto.fechaTermino)
  ) {
    errores.push('La fecha del evento debe estar dentro del rango del proyecto')
  }
  if (
    payload.latitud != null &&
    (!Number.isFinite(payload.latitud) || payload.latitud < -90 || payload.latitud > 90)
  ) {
    errores.push('La latitud debe estar entre -90 y 90')
  }
  if (
    payload.longitud != null &&
    (!Number.isFinite(payload.longitud) || payload.longitud < -180 || payload.longitud > 180)
  ) {
    errores.push('La longitud debe estar entre -180 y 180')
  }
  return errores
}

export async function listarProyectos(): Promise<Proyecto[]> {
  return api.proyectos()
}

export async function listarEventos(proyectoId: number): Promise<Evento[]> {
  return api.eventosDeProyecto(proyectoId)
}

export async function guardarProyecto(id: number | null, form: ProyectoForm): Promise<Proyecto> {
  const payload = formAProyecto(form)
  const errores = validarProyecto(payload)
  if (errores.length > 0) {
    throw new Error(errores.join('. '))
  }
  return id == null ? api.crearProyecto(payload) : api.actualizarProyecto(id, payload)
}

export async function guardarEvento(
  id: number | null,
  form: EventoForm,
  proyecto: Proyecto,
): Promise<Evento> {
  const payload = formAEvento(form)
  const errores = validarEvento(payload, proyecto)
  if (errores.length > 0) {
    throw new Error(errores.join('. '))
  }
  return id == null ? api.crearEvento(payload) : api.actualizarEvento(id, payload)
}

export async function borrarProyecto(id: number): Promise<void> {
  await api.eliminarProyecto(id)
}

export async function borrarEvento(id: number): Promise<void> {
  await api.eliminarEvento(id)
}
