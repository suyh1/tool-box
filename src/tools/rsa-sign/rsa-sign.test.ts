import { describe, expect, it } from 'vitest'
import { generateRsaKeyPair } from '../rsa-key/rsa-key'
import { signRsaMessage, verifyRsaSignature } from './rsa-sign'

describe('RSA signing utilities', () => {
  it('signs and verifies messages with RSASSA-PKCS1-v1_5', async () => {
    const keyPair = await generateRsaKeyPair({
      algorithm: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
      modulusLength: 2048,
    })

    if (!keyPair.ok) {
      throw new Error(keyPair.message)
    }

    const signed = await signRsaMessage('hello 你好', keyPair.privatePem, {
      algorithm: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    })

    expect(signed).toMatchObject({
      ok: true,
      algorithm: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    })

    if (!signed.ok) {
      throw new Error(signed.message)
    }

    expect(signed.signatureBase64).toMatch(/^[A-Za-z0-9+/]+={0,2}$/)

    await expect(verifyRsaSignature('hello 你好', signed.signatureBase64, keyPair.publicPem, {
      algorithm: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    })).resolves.toEqual({
      ok: true,
      algorithm: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
      verified: true,
    })

    await expect(verifyRsaSignature('changed', signed.signatureBase64, keyPair.publicPem, {
      algorithm: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    })).resolves.toMatchObject({
      ok: true,
      verified: false,
    })
  })

  it('returns readable errors for unsupported algorithms', async () => {
    await expect(signRsaMessage('hello', 'pem', {
      algorithm: 'RSA-OAEP',
      hash: 'SHA-256',
    })).resolves.toEqual({
      ok: false,
      message: '不支持的 RSA 签名算法：RSA-OAEP',
    })
  })
})
