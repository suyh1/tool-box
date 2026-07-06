import { describe, expect, it } from 'vitest'
import { hashBcryptPassword, verifyBcryptPassword } from './bcrypt'

describe('bcrypt utilities', () => {
  it('hashes passwords and verifies matching passwords', async () => {
    const hashed = await hashBcryptPassword('correct horse battery staple', 4)

    expect(hashed).toMatchObject({
      ok: true,
      rounds: 4,
    })

    if (!hashed.ok) {
      throw new Error(hashed.message)
    }

    expect(hashed.hash).toMatch(/^\$2[aby]\$04\$/)

    await expect(verifyBcryptPassword('correct horse battery staple', hashed.hash)).resolves.toEqual({
      ok: true,
      verified: true,
    })

    await expect(verifyBcryptPassword('wrong password', hashed.hash)).resolves.toEqual({
      ok: true,
      verified: false,
    })
  })

  it('returns readable errors for unsupported rounds', async () => {
    await expect(hashBcryptPassword('password', 3)).resolves.toEqual({
      ok: false,
      message: 'bcrypt rounds 必须在 4 到 14 之间。',
    })
  })
})
