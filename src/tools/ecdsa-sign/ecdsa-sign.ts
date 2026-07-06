export const supportedEcdsaCurves = ['P-256', 'P-384', 'P-521'] as const
export const supportedEcdsaHashes = ['SHA-256', 'SHA-384', 'SHA-512'] as const

export type EcdsaCurve = typeof supportedEcdsaCurves[number]
export type EcdsaHash = typeof supportedEcdsaHashes[number]

export interface EcdsaSignOptions {
  namedCurve: string
  hash: string
}

export type EcdsaKeyPairResult =
  | {
      ok: true
      namedCurve: EcdsaCurve
      publicPem: string
      privatePem: string
    }
  | {
      ok: false
      message: string
    }

export type EcdsaSignResult =
  | {
      ok: true
      namedCurve: EcdsaCurve
      hash: EcdsaHash
      signatureBase64: string
    }
  | {
      ok: false
      message: string
    }

export type EcdsaVerifyResult =
  | {
      ok: true
      namedCurve: EcdsaCurve
      hash: EcdsaHash
      verified: boolean
    }
  | {
      ok: false
      message: string
    }

const textEncoder = new TextEncoder()

function isEcdsaCurve(value: string): value is EcdsaCurve {
  return supportedEcdsaCurves.includes(value as EcdsaCurve)
}

function isEcdsaHash(value: string): value is EcdsaHash {
  return supportedEcdsaHashes.includes(value as EcdsaHash)
}

function parseOptions(options: EcdsaSignOptions) {
  if (!isEcdsaCurve(options.namedCurve)) {
    return {
      ok: false as const,
      message: `不支持的 ECDSA 曲线：${options.namedCurve}`,
    }
  }

  if (!isEcdsaHash(options.hash)) {
    return {
      ok: false as const,
      message: `不支持的 ECDSA hash：${options.hash}`,
    }
  }

  return {
    ok: true as const,
    namedCurve: options.namedCurve,
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

function arrayBufferToPem(buffer: ArrayBuffer, label: string) {
  const body = bytesToBase64(new Uint8Array(buffer)).match(/.{1,64}/g)?.join('\n') ?? ''
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`
}

function parsePem(pem: string, label: 'PUBLIC KEY' | 'PRIVATE KEY') {
  const pattern = new RegExp(`-----BEGIN ${label}-----([\\s\\S]+?)-----END ${label}-----`)
  const match = pem.trim().match(pattern)

  if (!match) {
    throw new Error(`请输入 ${label} PEM。`)
  }

  return toArrayBuffer(base64ToBytes(match[1]))
}

export async function generateEcdsaKeyPair(namedCurve: string): Promise<EcdsaKeyPairResult> {
  if (!isEcdsaCurve(namedCurve)) {
    return {
      ok: false,
      message: `不支持的 ECDSA 曲线：${namedCurve}`,
    }
  }

  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve,
      },
      true,
      ['sign', 'verify'],
    ) as CryptoKeyPair
    const [spki, pkcs8] = await Promise.all([
      crypto.subtle.exportKey('spki', keyPair.publicKey),
      crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
    ])

    return {
      ok: true,
      namedCurve,
      publicPem: arrayBufferToPem(spki, 'PUBLIC KEY'),
      privatePem: arrayBufferToPem(pkcs8, 'PRIVATE KEY'),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'ECDSA 密钥生成失败。',
    }
  }
}

async function importPrivateKey(privatePem: string, namedCurve: EcdsaCurve) {
  return crypto.subtle.importKey(
    'pkcs8',
    parsePem(privatePem, 'PRIVATE KEY'),
    {
      name: 'ECDSA',
      namedCurve,
    },
    false,
    ['sign'],
  )
}

async function importPublicKey(publicPem: string, namedCurve: EcdsaCurve) {
  return crypto.subtle.importKey(
    'spki',
    parsePem(publicPem, 'PUBLIC KEY'),
    {
      name: 'ECDSA',
      namedCurve,
    },
    false,
    ['verify'],
  )
}

export async function signEcdsaMessage(message: string, privatePem: string, options: EcdsaSignOptions): Promise<EcdsaSignResult> {
  const parsed = parseOptions(options)

  if (!parsed.ok) {
    return parsed
  }

  try {
    const key = await importPrivateKey(privatePem, parsed.namedCurve)
    const signature = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: parsed.hash,
      },
      key,
      toArrayBuffer(textEncoder.encode(message)),
    )

    return {
      ok: true,
      namedCurve: parsed.namedCurve,
      hash: parsed.hash,
      signatureBase64: bytesToBase64(new Uint8Array(signature)),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'ECDSA 签名失败。',
    }
  }
}

export async function verifyEcdsaSignature(
  message: string,
  signatureBase64: string,
  publicPem: string,
  options: EcdsaSignOptions,
): Promise<EcdsaVerifyResult> {
  const parsed = parseOptions(options)

  if (!parsed.ok) {
    return parsed
  }

  try {
    const key = await importPublicKey(publicPem, parsed.namedCurve)
    const verified = await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: parsed.hash,
      },
      key,
      toArrayBuffer(base64ToBytes(signatureBase64)),
      toArrayBuffer(textEncoder.encode(message)),
    )

    return {
      ok: true,
      namedCurve: parsed.namedCurve,
      hash: parsed.hash,
      verified,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'ECDSA 验签失败。',
    }
  }
}
