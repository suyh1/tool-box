import { describe, expect, it } from 'vitest'
import { generateHmac } from './hmac'

describe('hmac utilities', () => {
  it('generates HMAC-SHA-256 signatures in hex and base64', async () => {
    await expect(generateHmac('hello', 'secret', 'SHA-256')).resolves.toEqual({
      ok: true,
      algorithm: 'SHA-256',
      hex: '88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b',
      base64: 'iKqz7ejTrflNJquQ07r9SiCDBww7zOnAFO4EpEOEfAs=',
    })
  })

  it('returns readable errors for unsupported algorithms', async () => {
    await expect(generateHmac('hello', 'secret', 'MD5')).resolves.toEqual({
      ok: false,
      message: '不支持的 HMAC 算法：MD5',
    })
  })

  it('returns readable errors for empty secrets', async () => {
    await expect(generateHmac('hello', '', 'SHA-256')).resolves.toEqual({
      ok: false,
      message: 'HMAC 密钥不能为空。',
    })
  })
})
