import { describe, expect, it } from 'vitest'
import { generateTotp, verifyTotp } from './totp'

const rfcSha1Secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'

describe('totp utilities', () => {
  it('generates RFC 6238 SHA-1 TOTP codes', async () => {
    await expect(generateTotp(rfcSha1Secret, {
      timestamp: 59_000,
      period: 30,
      digits: 8,
      algorithm: 'SHA-1',
    })).resolves.toEqual({
      ok: true,
      code: '94287082',
      counter: 1,
      remainingSeconds: 1,
      algorithm: 'SHA-1',
      period: 30,
      digits: 8,
    })
  })

  it('verifies TOTP codes within the allowed window', async () => {
    await expect(verifyTotp('94287082', rfcSha1Secret, {
      timestamp: 59_000,
      period: 30,
      digits: 8,
      algorithm: 'SHA-1',
      window: 0,
    })).resolves.toEqual({
      ok: true,
      verified: true,
      delta: 0,
    })

    await expect(verifyTotp('94287082', rfcSha1Secret, {
      timestamp: 90_000,
      period: 30,
      digits: 8,
      algorithm: 'SHA-1',
      window: 0,
    })).resolves.toEqual({
      ok: true,
      verified: false,
    })
  })

  it('returns readable errors for invalid Base32 secrets', async () => {
    await expect(generateTotp('not valid!', {
      timestamp: 59_000,
      period: 30,
      digits: 6,
      algorithm: 'SHA-1',
    })).resolves.toEqual({
      ok: false,
      message: 'TOTP secret 必须是有效的 Base32。',
    })
  })
})
