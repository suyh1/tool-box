import { describe, expect, it } from 'vitest'
import { generateRsaKeyPair } from './rsa-key'

describe('RSA key generation utilities', () => {
  it('generates exportable RSA signing key pairs', async () => {
    const result = await generateRsaKeyPair({
      algorithm: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
      modulusLength: 2048,
    })

    expect(result).toMatchObject({
      ok: true,
      algorithm: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
      modulusLength: 2048,
    })

    if (!result.ok) {
      throw new Error(result.message)
    }

    expect(result.publicPem).toContain('-----BEGIN PUBLIC KEY-----')
    expect(result.privatePem).toContain('-----BEGIN PRIVATE KEY-----')
    expect(result.publicJwk).toMatchObject({
      kty: 'RSA',
      e: 'AQAB',
    })
    expect(result.privateJwk).toMatchObject({
      kty: 'RSA',
      e: 'AQAB',
    })
    expect(typeof result.privateJwk.d).toBe('string')
  })

  it('returns readable errors for unsupported modulus lengths', async () => {
    await expect(generateRsaKeyPair({
      algorithm: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
      modulusLength: 1024,
    })).resolves.toEqual({
      ok: false,
      message: 'RSA 模长必须是 2048、3072 或 4096。',
    })
  })
})
