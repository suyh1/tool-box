import { describe, expect, it } from 'vitest'
import { digestText } from './hash'

describe('hash utilities', () => {
  it('creates SHA-256 hashes', async () => {
    await expect(digestText('hello', 'SHA-256')).resolves.toEqual({
      ok: true,
      value: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    })
  })

  it('returns errors for unsupported algorithms', async () => {
    await expect(digestText('hello', 'MD5')).resolves.toMatchObject({ ok: false })
  })
})
