import { describe, expect, it } from 'vitest'
import { generateEcdsaKeyPair, signEcdsaMessage, verifyEcdsaSignature } from './ecdsa-sign'

describe('ECDSA signing utilities', () => {
  it('generates keys then signs and verifies messages with P-256', async () => {
    const keys = await generateEcdsaKeyPair('P-256')

    expect(keys).toMatchObject({
      ok: true,
      namedCurve: 'P-256',
    })

    if (!keys.ok) {
      throw new Error(keys.message)
    }

    expect(keys.publicPem).toContain('-----BEGIN PUBLIC KEY-----')
    expect(keys.privatePem).toContain('-----BEGIN PRIVATE KEY-----')

    const signed = await signEcdsaMessage('hello 你好', keys.privatePem, {
      namedCurve: 'P-256',
      hash: 'SHA-256',
    })

    expect(signed).toMatchObject({
      ok: true,
      namedCurve: 'P-256',
      hash: 'SHA-256',
    })

    if (!signed.ok) {
      throw new Error(signed.message)
    }

    await expect(verifyEcdsaSignature('hello 你好', signed.signatureBase64, keys.publicPem, {
      namedCurve: 'P-256',
      hash: 'SHA-256',
    })).resolves.toEqual({
      ok: true,
      namedCurve: 'P-256',
      hash: 'SHA-256',
      verified: true,
    })

    await expect(verifyEcdsaSignature('changed', signed.signatureBase64, keys.publicPem, {
      namedCurve: 'P-256',
      hash: 'SHA-256',
    })).resolves.toMatchObject({
      ok: true,
      verified: false,
    })
  })

  it('returns readable errors for unsupported curves', async () => {
    await expect(generateEcdsaKeyPair('P-192')).resolves.toEqual({
      ok: false,
      message: '不支持的 ECDSA 曲线：P-192',
    })
  })
})
