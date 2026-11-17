export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080/api'

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
  timestamp: string
}

export interface Usuario {
  id: string
  email: string
  nombre: string
  roles: string[]
  activo: boolean
}

export interface LoginResponse {
  accessToken: string
  idToken: string
  refreshToken: string
  expiresIn: number
}

export interface RegistroPayload {
  email: string
  password: string
  nombre: string
  roles: string[]
}

export interface Proyecto {
  proyectoId: number
  titulo: string
  descripcion: string
  areaTematica: string
  unidadVecinal: string
  fechaInicio: number
  fechaTermino: number
  estado: string
}

export type ProyectoInput = Omit<Proyecto, 'proyectoId'>

export interface Evento {
  eventoId: number
  proyectoId: number
  nombre: string
  fechaHora: number
  cuposMax: number
  recinto: string
  latitud: number | null
  longitud: number | null
  radioMetros: number
}

export type EventoInput = Omit<Evento, 'eventoId'>

const TOKEN_KEY = 'syncpass_token'
const REFRESH_KEY = 'syncpass_refresh'

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)

export const setTokens = (tokens: LoginResponse) => {
  localStorage.setItem(TOKEN_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
}

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  const token = getToken()
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      (typeof payload === 'object' && payload?.message) || `Error ${response.status}`
    throw new Error(message)
  }

  return (typeof payload === 'object' && 'data' in payload ? payload.data : payload) as T
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false),

  logout: () => request<void>('/auth/logout', { method: 'POST' }).catch(() => undefined),

  usuarios: () => request<Usuario[]>('/usuarios'),

  darDeBaja: (id: string) => request<Usuario>(`/usuarios/${id}/baja`, { method: 'PATCH' }),

  darDeAlta: (id: string) => request<Usuario>(`/usuarios/${id}/alta`, { method: 'PATCH' }),

  eliminar: (id: string) => request<void>(`/usuarios/${id}`, { method: 'DELETE' }),

  registrar: (payload: RegistroPayload) =>
    request<Usuario>('/auth/registro', { method: 'POST', body: JSON.stringify(payload) }),

  resumen: () =>
    request<{ usuarios: number; eventos: number; asistencias: number; encuestas: number }>(
      '/dashboard/resumen',
    ),

  proyectos: () => request<Proyecto[]>('/proyectos'),

  crearProyecto: (payload: ProyectoInput) =>
    request<Proyecto>('/proyectos', { method: 'POST', body: JSON.stringify(payload) }),

  actualizarProyecto: (id: number, payload: ProyectoInput) =>
    request<Proyecto>(`/proyectos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  eliminarProyecto: (id: number) =>
    request<void>(`/proyectos/${id}`, { method: 'DELETE' }),

  eventosDeProyecto: (proyectoId: number) =>
    request<Evento[]>(`/proyectos/${proyectoId}/eventos`),

  crearEvento: (payload: EventoInput) =>
    request<Evento>('/eventos', { method: 'POST', body: JSON.stringify(payload) }),

  actualizarEvento: (id: number, payload: EventoInput) =>
    request<Evento>(`/eventos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  eliminarEvento: (id: number) =>
    request<void>(`/eventos/${id}`, { method: 'DELETE' }),
}

export interface SessionUser {
  id: string
  email: string
  nombre: string
  roles: string[]
}

export function decodeSession(token: string): SessionUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload.sub ?? '',
      email: payload.email ?? '',
      nombre: payload.nombre ?? payload.name ?? '',
      roles: payload.roles ?? payload['cognito:groups'] ?? [],
    }
  } catch {
    return null
  }
}
