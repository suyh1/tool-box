export const supportedRsaSignAlgorithms = ['RSASSA-PKCS1-v1_5', 'RSA-PSS'] as const
export const supportedRsaSignHashes = ['SHA-256', 'SHA-384', 'SHA-512'] as const

export type RsaSignAlgorithm = typeof supportedRsaSignAlgorithms[number]
export type RsaSignHash = typeof supportedRsaSignHashes[number]

export interface RsaSignOptions {
  algorithm: string
  hash: string
}

export type RsaSignResult =
  | {
      ok: true
      algorithm: RsaSignAlgorithm
      hash: RsaSignHash
      signatureBase64: string
    }
  | {
      ok: false
      message: string
    }

export type RsaVerifyResult =
  | {
      ok: true
      algorithm: RsaSignAlgorithm
      hash: RsaSignHash
      verified: boolean
    }
  | {
      ok: false
      message: string
    }

const textEncoder = new TextEncoder()

function isRsaSignAlgorithm(value: string): value is RsaSignAlgorithm {
  return supportedRsaSignAlgorithms.includes(value as RsaSignAlgorithm)
}

function isRsaSignHash(value: string): value is RsaSignHash {
  return supportedRsaSignHashes.includes(value as RsaSignHash)
}

function parseOptions(options: RsaSignOptions) {
  if (!isRsaSignAlgorithm(options.algorithm)) {
    return {
      ok: false as const,
      message: `不支持的 RSA 签名算法：${options.algorithm}`,
    }
  }

  if (!isRsaSignHash(options.hash)) {
    return {
      ok: false as const,
      message: `不支持的 RSA hash：${options.hash}`,
    }
  }

  return {
    ok: true as const,
    algorithm: options.algorithm,
    hash: options.hash,
  }
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

function base64ToBytes(value: string) {
  const normalized = value.replace(/\s/g, '')

  if (normalized.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new Error('Base64 签名无效。')
  }

  const binary = atob(normalized)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function bytesToBase64(bytes: Uint8Array) {
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary)
}

function parsePem(pem: string, label: 'PUBLIC KEY' | 'PRIVATE KEY') {
  const pattern = new RegExp(`-----BEGIN ${label}-----([\\s\\S]+?)-----END ${label}-----`)
  const match = pem.trim().match(pattern)

  if (!match) {
    throw new Error(`请输入 ${label} PEM。`)
  }

  return toArrayBuffer(base64ToBytes(match[1]))
}

function saltLength(hash: RsaSignHash) {
  return hash === 'SHA-512' ? 64 : hash === 'SHA-384' ? 48 : 32
}

function operationAlgorithm(algorithm: RsaSignAlgorithm, hash: RsaSignHash) {
  return algorithm === 'RSA-PSS'
    ? {
        name: 'RSA-PSS',
        saltLength: saltLength(hash),
      }
    : {
        name: 'RSASSA-PKCS1-v1_5',
      }
}

async function importPrivateKey(privatePem: string, algorithm: RsaSignAlgorithm, hash: RsaSignHash) {
  return crypto.subtle.importKey(
    'pkcs8',
    parsePem(privatePem, 'PRIVATE KEY'),
    {
      name: algorithm,
      hash,
    },
    false,
    ['sign'],
  )
}

async function importPublicKey(publicPem: string, algorithm: RsaSignAlgorithm, hash: RsaSignHash) {
  return crypto.subtle.importKey(
    'spki',
    parsePem(publicPem, 'PUBLIC KEY'),
    {
      name: algorithm,
      hash,
    },
    false,
    ['verify'],
  )
}

export async function signRsaMessage(message: string, privatePem: string, options: RsaSignOptions): Promise<RsaSignResult> {
  const parsed = parseOptions(options)

  if (!parsed.ok) {
    return parsed
  }

  try {
    const key = await importPrivateKey(privatePem, parsed.algorithm, parsed.hash)
    const signature = await crypto.subtle.sign(
      operationAlgorithm(parsed.algorithm, parsed.hash),
      key,
      toArrayBuffer(textEncoder.encode(message)),
    )

    return {
      ok: true,
      algorithm: parsed.algorithm,
      hash: parsed.hash,
      signatureBase64: bytesToBase64(new Uint8Array(signature)),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'RSA 签名失败。',
    }
  }
}

export async function verifyRsaSignature(
  message: string,
  signatureBase64: string,
  publicPem: string,
  options: RsaSignOptions,
): Promise<RsaVerifyResult> {
  const parsed = parseOptions(options)

  if (!parsed.ok) {
    return parsed
  }

  try {
    const key = await importPublicKey(publicPem, parsed.algorithm, parsed.hash)
    const verified = await crypto.subtle.verify(
      operationAlgorithm(parsed.algorithm, parsed.hash),
      key,
      toArrayBuffer(base64ToBytes(signatureBase64)),
      toArrayBuffer(textEncoder.encode(message)),
    )

    return {
      ok: true,
      algorithm: parsed.algorithm,
      hash: parsed.hash,
      verified,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'RSA 验签失败。',
    }
  }
}
