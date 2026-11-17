import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth'
import type { Evento, Proyecto } from '../api'
import Nav from '../components/Nav'
import {
  borrarEvento,
  eventoAForm,
  eventoVacio,
  formatearFechaHora,
  guardarEvento,
  listarEventos,
  listarProyectos,
  puedeEditarCatalogo,
} from '../catalogo'
import type { EventoForm } from '../catalogo'

export default function Eventos() {
  const { user } = useAuth()
  const puedeEditar = puedeEditarCatalogo(user?.roles ?? [])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [proyectoId, setProyectoId] = useState('')
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [form, setForm] = useState<EventoForm>(eventoVacio)
  const [editandoId, setEditandoId] = useState<number | null>(null)

  const proyectoSeleccionado = proyectos.find((p) => String(p.proyectoId) === proyectoId)

  const cargarProyectos = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const lista = await listarProyectos()
      setProyectos(lista)
      setProyectoId((actual) => {
        if (actual && lista.some((p) => String(p.proyectoId) === actual)) return actual
        return lista[0] ? String(lista[0].proyectoId) : ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los proyectos')
    } finally {
      setCargando(false)
    }
  }, [])

  const cargarEventos = useCallback(async (id: number) => {
    try {
      setEventos(await listarEventos(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los eventos')
    }
  }, [])

  useEffect(() => {
    void cargarProyectos()
  }, [cargarProyectos])

  useEffect(() => {
    setForm((actual) =>
      actual.proyectoId === proyectoId ? actual : { ...actual, proyectoId },
    )
  }, [proyectoId])

  useEffect(() => {
    if (!proyectoId) {
      setEventos([])
      return
    }
    void cargarEventos(Number(proyectoId))
  }, [proyectoId, cargarEventos])

  function actualizar(campo: keyof EventoForm, valor: string) {
    setForm((actual) => ({ ...actual, [campo]: valor }))
  }

  function seleccionarProyecto(valor: string) {
    setProyectoId(valor)
    setEditandoId(null)
    setEventos([])
    setOk(null)
    setError(null)
    setForm({ ...eventoVacio, proyectoId: valor })
  }

  function editar(evento: Evento) {
    setProyectoId(String(evento.proyectoId))
    setEditandoId(evento.eventoId)
    setForm(eventoAForm(evento))
    setOk(null)
    setError(null)
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setForm({ ...eventoVacio, proyectoId })
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setOk(null)
    if (!proyectoSeleccionado) {
      setError('Debe seleccionar un proyecto')
      return
    }
    try {
      await guardarEvento(editandoId, form, proyectoSeleccionado)
      setOk(editandoId == null ? 'Evento creado' : 'Evento actualizado')
      cancelarEdicion()
      await cargarEventos(proyectoSeleccionado.proyectoId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el evento')
    }
  }

  async function eliminar(evento: Evento) {
    if (!window.confirm(`¿Eliminar el evento "${evento.nombre}"?`)) return
    setError(null)
    setOk(null)
    try {
      await borrarEvento(evento.eventoId)
      setOk('Evento eliminado')
      if (proyectoSeleccionado) await cargarEventos(proyectoSeleccionado.proyectoId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el evento')
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Eventos</h1>
        </div>
        <Nav />
      </header>

      {error && <p className="error">{error}</p>}
      {ok && <p className="ok">{ok}</p>}

      <section className="card">
        <label>
          Proyecto
          <select value={proyectoId} onChange={(event) => seleccionarProyecto(event.target.value)}>
            {proyectos.length === 0 && <option value="">Sin proyectos</option>}
            {proyectos.map((proyecto) => (
              <option key={proyecto.proyectoId} value={String(proyecto.proyectoId)}>
                {proyecto.titulo}
              </option>
            ))}
          </select>
        </label>
      </section>

      {puedeEditar && proyectoSeleccionado ? (
        <section className="card">
          <h2>{editandoId == null ? 'Nuevo evento' : 'Editar evento'}</h2>
          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              Nombre
              <input
                value={form.nombre}
                onChange={(event) => actualizar('nombre', event.target.value)}
                required
              />
            </label>
            <label>
              Fecha y hora
              <input
                type="datetime-local"
                value={form.fechaHora}
                onChange={(event) => actualizar('fechaHora', event.target.value)}
                required
              />
            </label>
            <label>
              Cupos máximos
              <input
                type="number"
                min={1}
                value={form.cuposMax}
                onChange={(event) => actualizar('cuposMax', event.target.value)}
                required
              />
            </label>
            <label>
              Recinto
              <input
                value={form.recinto}
                onChange={(event) => actualizar('recinto', event.target.value)}
                required
              />
            </label>
            <label>
              Radio (metros)
              <input
                type="number"
                min={1}
                value={form.radioMetros}
                onChange={(event) => actualizar('radioMetros', event.target.value)}
                required
              />
            </label>
            <label>
              Latitud
              <input
                type="number"
                step="any"
                value={form.latitud}
                onChange={(event) => actualizar('latitud', event.target.value)}
                placeholder="-33.05"
              />
            </label>
            <label>
              Longitud
              <input
                type="number"
                step="any"
                value={form.longitud}
                onChange={(event) => actualizar('longitud', event.target.value)}
                placeholder="-71.61"
              />
            </label>
            <div className="row form-actions">
              <button type="submit">{editandoId == null ? 'Crear evento' : 'Guardar cambios'}</button>
              {editandoId != null && (
                <button type="button" className="ghost" onClick={cancelarEdicion}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
      ) : (
        !puedeEditar && (
          <p className="muted">Solo el rol Coordinador puede crear, editar o eliminar eventos.</p>
        )
      )}

      <section className="card">
        <h2>Eventos del proyecto</h2>
        {cargando ? (
          <p className="muted">Cargando…</p>
        ) : !proyectoSeleccionado ? (
          <p className="muted">Cree un proyecto antes de registrar eventos.</p>
        ) : eventos.length === 0 ? (
          <p className="muted">Este proyecto todavía no tiene eventos.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha y hora</th>
                  <th>Cupos</th>
                  <th>Recinto</th>
                  <th>Radio</th>
                  {puedeEditar && <th />}
                </tr>
              </thead>
              <tbody>
                {eventos.map((evento) => (
                  <tr key={evento.eventoId}>
                    <td>{evento.nombre}</td>
                    <td>{formatearFechaHora(evento.fechaHora)}</td>
                    <td>{evento.cuposMax}</td>
                    <td>{evento.recinto}</td>
                    <td>{evento.radioMetros} m</td>
                    {puedeEditar && (
                      <td className="row">
                        <button className="ghost small" onClick={() => editar(evento)}>
                          Editar
                        </button>
                        <button
                          className="ghost small danger"
                          onClick={() => void eliminar(evento)}
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
