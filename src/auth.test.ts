import { describe, expect, it } from 'vitest'
import { decodeSession } from './api'

function token(payload: Record<string, unknown>): string {
  const body = btoa(JSON.stringify(payload))
  return `header.${body}.firma`
}

describe('decodeSession', () => {
  it('rechaza un token vencido', () => {
    const vencido = token({
      sub: '1',
      email: 'coordinador@syncpass.cl',
      roles: ['Coordinador'],
      exp: Math.floor(Date.now() / 1000) - 60,
    })

    expect(decodeSession(vencido)).toBeNull()
  })

  it('acepta un token vigente y conserva el rol', () => {
    const vigente = token({
      sub: '1',
      email: 'coordinador@syncpass.cl',
      nombre: 'Camila Rojas',
      roles: ['Coordinador'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    })

    expect(decodeSession(vigente)).toMatchObject({
      email: 'coordinador@syncpass.cl',
      nombre: 'Camila Rojas',
      roles: ['Coordinador'],
    })
  })
})
