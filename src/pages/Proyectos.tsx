import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth'
import type { Proyecto } from '../api'
import Nav from '../components/Nav'
import {
  borrarProyecto,
  ESTADOS_PROYECTO,
  formatearFecha,
  guardarProyecto,
  listarProyectos,
  proyectoAForm,
  proyectoVacio,
  puedeEditarCatalogo,
} from '../catalogo'
import type { ProyectoForm } from '../catalogo'

export default function Proyectos() {
  const { user } = useAuth()
  const puedeEditar = puedeEditarCatalogo(user?.roles ?? [])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [form, setForm] = useState<ProyectoForm>(proyectoVacio)
  const [editandoId, setEditandoId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setProyectos(await listarProyectos())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los proyectos')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  function actualizar(campo: keyof ProyectoForm, valor: string) {
    setForm((actual) => ({ ...actual, [campo]: valor }))
  }

  function editar(proyecto: Proyecto) {
    setEditandoId(proyecto.proyectoId)
    setForm(proyectoAForm(proyecto))
    setOk(null)
    setError(null)
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setForm(proyectoVacio)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setOk(null)
    try {
      await guardarProyecto(editandoId, form)
      setOk(editandoId == null ? 'Proyecto creado' : 'Proyecto actualizado')
      cancelarEdicion()
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el proyecto')
    }
  }

  async function eliminar(proyecto: Proyecto) {
    if (!window.confirm(`¿Eliminar el proyecto "${proyecto.titulo}"?`)) return
    setError(null)
    setOk(null)
    try {
      await borrarProyecto(proyecto.proyectoId)
      setOk('Proyecto eliminado')
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el proyecto')
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Proyectos</h1>
        </div>
        <Nav />
      </header>

      {error && <p className="error">{error}</p>}
      {ok && <p className="ok">{ok}</p>}

      {puedeEditar ? (
        <section className="card">
          <h2>{editandoId == null ? 'Nuevo proyecto' : 'Editar proyecto'}</h2>
          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              Título
              <input
                value={form.titulo}
                onChange={(event) => actualizar('titulo', event.target.value)}
                required
              />
            </label>
            <label>
              Área temática
              <input
                value={form.areaTematica}
                onChange={(event) => actualizar('areaTematica', event.target.value)}
                required
              />
            </label>
            <label>
              Unidad vecinal
              <input
                value={form.unidadVecinal}
                onChange={(event) => actualizar('unidadVecinal', event.target.value)}
                required
              />
            </label>
            <label>
              Estado
              <select
                value={form.estado}
                onChange={(event) => actualizar('estado', event.target.value)}
              >
                {ESTADOS_PROYECTO.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Inicio
              <input
                type="date"
                value={form.fechaInicio}
                onChange={(event) => actualizar('fechaInicio', event.target.value)}
                required
              />
            </label>
            <label>
              Término
              <input
                type="date"
                value={form.fechaTermino}
                onChange={(event) => actualizar('fechaTermino', event.target.value)}
                required
              />
            </label>
            <label className="wide">
              Descripción
              <textarea
                value={form.descripcion}
                onChange={(event) => actualizar('descripcion', event.target.value)}
                rows={3}
                required
              />
            </label>
            <div className="row form-actions">
              <button type="submit">{editandoId == null ? 'Crear proyecto' : 'Guardar cambios'}</button>
              {editandoId != null && (
                <button type="button" className="ghost" onClick={cancelarEdicion}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
      ) : (
        <p className="muted">Solo el rol Coordinador puede crear, editar o eliminar proyectos.</p>
      )}

      <section className="card">
        <h2>Proyectos registrados</h2>
        {cargando ? (
          <p className="muted">Cargando…</p>
        ) : proyectos.length === 0 ? (
          <p className="muted">Todavía no hay proyectos.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Área</th>
                  <th>Unidad</th>
                  <th>Inicio</th>
                  <th>Término</th>
                  <th>Estado</th>
                  {puedeEditar && <th />}
                </tr>
              </thead>
              <tbody>
                {proyectos.map((proyecto) => (
                  <tr key={proyecto.proyectoId}>
                    <td>{proyecto.titulo}</td>
                    <td>{proyecto.areaTematica}</td>
                    <td>{proyecto.unidadVecinal}</td>
                    <td>{formatearFecha(proyecto.fechaInicio)}</td>
                    <td>{formatearFecha(proyecto.fechaTermino)}</td>
                    <td>{proyecto.estado.replace('_', ' ')}</td>
                    {puedeEditar && (
                      <td className="row">
                        <button className="ghost small" onClick={() => editar(proyecto)}>
                          Editar
                        </button>
                        <button
                          className="ghost small danger"
                          onClick={() => void eliminar(proyecto)}
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
