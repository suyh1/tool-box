import { describe, expect, it } from 'vitest'
import { decryptAesGcm, encryptAesGcm } from './aes'

const keyHex = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'
const ivHex = '1a1b1c1d1e1f202122232425'

describe('AES utilities', () => {
  it('encrypts and decrypts UTF-8 text with AES-GCM', async () => {
    const encrypted = await encryptAesGcm('hello 你好', keyHex, ivHex)

    expect(encrypted).toMatchObject({
      ok: true,
      algorithm: 'AES-GCM',
    })

    if (!encrypted.ok) {
      throw new Error(encrypted.message)
    }

    expect(encrypted.ciphertextBase64).toMatch(/^[A-Za-z0-9+/]+={0,2}$/)

    await expect(decryptAesGcm(encrypted.ciphertextBase64, keyHex, ivHex)).resolves.toEqual({
      ok: true,
      algorithm: 'AES-GCM',
      plaintext: 'hello 你好',
    })
  })

  it('returns readable errors for invalid key lengths', async () => {
    await expect(encryptAesGcm('hello', 'abcd', ivHex)).resolves.toEqual({
      ok: false,
      message: 'AES key 必须是 128、192 或 256 位十六进制。',
    })
  })

  it('returns readable errors for invalid IV lengths', async () => {
    await expect(encryptAesGcm('hello', keyHex, 'abcd')).resolves.toEqual({
      ok: false,
      message: 'AES-GCM IV 必须是 12 字节十六进制。',
    })
  })
})
