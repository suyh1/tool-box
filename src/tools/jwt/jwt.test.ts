import { describe, expect, it } from 'vitest'
import { decodeJwt } from './jwt'

const validToken = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRvb2xib3giLCJhZG1pbiI6dHJ1ZX0',
  'signature',
].join('.')

describe('jwt utilities', () => {
  it('decodes a valid three-part JWT without verifying the signature', () => {
    expect(decodeJwt(validToken)).toEqual({
      ok: true,
      header: {
        alg: 'HS256',
        typ: 'JWT',
      },
      payload: {
        sub: '1234567890',
        name: 'Toolbox',
        admin: true,
      },
      signature: 'signature',
      verified: false,
    })
  })

  it('returns errors for malformed tokens', () => {
    expect(decodeJwt('abc.def')).toMatchObject({ ok: false })
  })

  it('returns errors for invalid Base64URL payloads', () => {
    expect(decodeJwt('abc.%%%.sig')).toMatchObject({ ok: false })
  })
})
