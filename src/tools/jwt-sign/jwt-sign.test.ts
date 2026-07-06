import { describe, expect, it } from 'vitest'
import { decodeJwt } from '../jwt/jwt'
import { signJwt, verifyJwtSignature } from './jwt-sign'

function encodeJsonSegment(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

describe('jwt signing utilities', () => {
  it('signs and verifies an HS256 JWT', async () => {
    const signed = await signJwt({
      algorithm: 'HS256',
      secret: 'secret',
      header: { kid: 'local' },
      payload: {
        sub: '1234567890',
        name: 'Toolbox',
        admin: true,
      },
    })

    expect(signed).toMatchObject({
      ok: true,
      algorithm: 'HS256',
    })

    if (!signed.ok) {
      throw new Error(signed.message)
    }

    expect(signed.token.split('.')).toHaveLength(3)
    expect(decodeJwt(signed.token)).toMatchObject({
      ok: true,
      header: {
        alg: 'HS256',
        typ: 'JWT',
        kid: 'local',
      },
      payload: {
        sub: '1234567890',
        name: 'Toolbox',
        admin: true,
      },
    })

    await expect(verifyJwtSignature(signed.token, 'secret')).resolves.toMatchObject({
      ok: true,
      verified: true,
      algorithm: 'HS256',
      payload: {
        sub: '1234567890',
        name: 'Toolbox',
        admin: true,
      },
    })
  })

  it('returns verified false for a tampered JWT payload', async () => {
    const signed = await signJwt({
      algorithm: 'HS256',
      secret: 'secret',
      payload: { sub: '1234567890' },
    })

    if (!signed.ok) {
      throw new Error(signed.message)
    }

    const [header, , signature] = signed.token.split('.')
    const tamperedToken = [header, encodeJsonSegment({ sub: 'changed' }), signature].join('.')

    await expect(verifyJwtSignature(tamperedToken, 'secret')).resolves.toMatchObject({
      ok: true,
      verified: false,
      payload: { sub: 'changed' },
    })
  })

  it('rejects unsupported JWT signing algorithms', async () => {
    const token = [
      encodeJsonSegment({ alg: 'none', typ: 'JWT' }),
      encodeJsonSegment({ sub: '1234567890' }),
      'signature',
    ].join('.')

    await expect(verifyJwtSignature(token, 'secret')).resolves.toEqual({
      ok: false,
      message: '不支持的 JWT 签名算法：none',
    })
  })
})
