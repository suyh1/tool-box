import { describe, expect, it } from 'vitest'
import { jwkToPem, pemToJwk } from './jwk-pem'

function arrayBufferToPem(buffer: ArrayBuffer, label: string) {
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  const body = btoa(binary).match(/.{1,64}/g)?.join('\n') ?? ''
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`
}

async function generateRsaKeyPair() {
  return crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  ) as Promise<CryptoKeyPair>
}

describe('JWK PEM utilities', () => {
  it('converts an RSA public PEM to JWK and back to PEM', async () => {
    const keyPair = await generateRsaKeyPair()
    const spki = await crypto.subtle.exportKey('spki', keyPair.publicKey)
    const pem = arrayBufferToPem(spki, 'PUBLIC KEY')

    const jwk = await pemToJwk(pem)

    expect(jwk).toMatchObject({
      ok: true,
      keyType: 'public',
    })

    if (!jwk.ok) {
      throw new Error(jwk.message)
    }

    expect(jwk.value).toMatchObject({
      kty: 'RSA',
      e: 'AQAB',
    })
    expect(typeof jwk.value.n).toBe('string')

    const convertedPem = await jwkToPem(jwk.value)

    expect(convertedPem).toMatchObject({
      ok: true,
      keyType: 'public',
    })

    if (!convertedPem.ok) {
      throw new Error(convertedPem.message)
    }

    expect(convertedPem.value).toContain('-----BEGIN PUBLIC KEY-----')
    expect(convertedPem.value).toContain('-----END PUBLIC KEY-----')
  })

  it('converts an RSA private PEM to a private JWK', async () => {
    const keyPair = await generateRsaKeyPair()
    const pkcs8 = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
    const pem = arrayBufferToPem(pkcs8, 'PRIVATE KEY')

    const jwk = await pemToJwk(pem)

    expect(jwk).toMatchObject({
      ok: true,
      keyType: 'private',
    })

    if (!jwk.ok) {
      throw new Error(jwk.message)
    }

    expect(jwk.value).toMatchObject({
      kty: 'RSA',
      e: 'AQAB',
    })
    expect(typeof jwk.value.d).toBe('string')
  })

  it('returns readable errors for invalid PEM input', async () => {
    await expect(pemToJwk('not a pem')).resolves.toEqual({
      ok: false,
      message: '请输入 PUBLIC KEY 或 PRIVATE KEY PEM。',
    })
  })
})
