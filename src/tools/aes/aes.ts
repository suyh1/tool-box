export type AesResult =
  | {
      ok: true
      algorithm: 'AES-GCM'
      ciphertextBase64: string
    }
  | {
      ok: false
      message: string
    }

export type AesDecryptResult =
  | {
      ok: true
      algorithm: 'AES-GCM'
      plaintext: string
    }
  | {
      ok: false
      message: string
    }

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder('utf-8', { fatal: true })

function normalizeHex(value: string) {
  return value.replace(/[\s:_-]/g, '').toLowerCase()
}

function hexToBytes(value: string) {
  const compact = normalizeHex(value)

  if (compact.length % 2 !== 0 || !/^[0-9a-f]*$/.test(compact)) {
    throw new Error('十六进制输入无效。')
  }

  return Uint8Array.from(compact.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16))
}

function bytesToBase64(bytes: Uint8Array) {
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary)
}

function base64ToBytes(value: string) {
  const normalized = value.replace(/\s/g, '')

  if (normalized.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new Error('Base64 密文无效。')
  }

  const binary = atob(normalized)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function validateKey(bytes: Uint8Array) {
  return bytes.length === 16 || bytes.length === 24 || bytes.length === 32
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

function parseKeyAndIv(keyHex: string, ivHex: string) {
  const keyBytes = hexToBytes(keyHex)

  if (!validateKey(keyBytes)) {
    return {
      ok: false as const,
      message: 'AES key 必须是 128、192 或 256 位十六进制。',
    }
  }

  const ivBytes = hexToBytes(ivHex)

  if (ivBytes.length !== 12) {
    return {
      ok: false as const,
      message: 'AES-GCM IV 必须是 12 字节十六进制。',
    }
  }

  return {
    ok: true as const,
    keyBytes,
    ivBytes,
  }
}

async function importAesKey(keyBytes: Uint8Array) {
  return crypto.subtle.importKey('raw', toArrayBuffer(keyBytes), 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptAesGcm(plaintext: string, keyHex: string, ivHex: string): Promise<AesResult> {
  try {
    const parsed = parseKeyAndIv(keyHex, ivHex)

    if (!parsed.ok) {
      return parsed
    }

    const key = await importAesKey(parsed.keyBytes)
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: toArrayBuffer(parsed.ivBytes),
        tagLength: 128,
      },
      key,
      toArrayBuffer(textEncoder.encode(plaintext)),
    )

    return {
      ok: true,
      algorithm: 'AES-GCM',
      ciphertextBase64: bytesToBase64(new Uint8Array(ciphertext)),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'AES-GCM 加密失败。',
    }
  }
}

export async function decryptAesGcm(ciphertextBase64: string, keyHex: string, ivHex: string): Promise<AesDecryptResult> {
  try {
    const parsed = parseKeyAndIv(keyHex, ivHex)

    if (!parsed.ok) {
      return parsed
    }

    const key = await importAesKey(parsed.keyBytes)
    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: toArrayBuffer(parsed.ivBytes),
        tagLength: 128,
      },
      key,
      toArrayBuffer(base64ToBytes(ciphertextBase64)),
    )

    return {
      ok: true,
      algorithm: 'AES-GCM',
      plaintext: textDecoder.decode(plaintext),
    }
  } catch {
    return {
      ok: false,
      message: 'AES-GCM 解密失败，请检查密钥、IV 和密文。',
    }
  }
}

export function randomHex(bytes: number) {
  const value = new Uint8Array(bytes)
  crypto.getRandomValues(value)
  return [...value].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
