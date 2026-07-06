export const supportedJwtAlgorithms = ['HS256', 'HS384', 'HS512'] as const

export type JwtAlgorithm = typeof supportedJwtAlgorithms[number]

export interface JwtSignInput {
  algorithm: string
  secret: string
  header?: Record<string, unknown>
  payload: unknown
}

export type JwtSignResult =
  | {
      ok: true
      token: string
      algorithm: JwtAlgorithm
      header: Record<string, unknown>
      payload: unknown
    }
  | {
      ok: false
      message: string
    }

export type JwtVerifyResult =
  | {
      ok: true
      verified: boolean
      algorithm: JwtAlgorithm
      header: Record<string, unknown>
      payload: unknown
    }
  | {
      ok: false
      message: string
    }

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder('utf-8', { fatal: true })

const algorithmToHash: Record<JwtAlgorithm, string> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
}

function isJwtAlgorithm(value: string): value is JwtAlgorithm {
  return supportedJwtAlgorithms.includes(value as JwtAlgorithm)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function bytesToBase64Url(bytes: Uint8Array) {
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlToBytes(segment: string) {
  if (segment.length % 4 === 1 || !/^[A-Za-z0-9_-]*$/.test(segment)) {
    throw new Error('Base64URL 片段无效')
  }

  const padded = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=')
  const binary = atob(padded)

  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function encodeJsonSegment(value: unknown) {
  return bytesToBase64Url(textEncoder.encode(JSON.stringify(value)))
}

function decodeJsonSegment(segment: string) {
  return JSON.parse(textDecoder.decode(base64UrlToBytes(segment))) as unknown
}

function splitJwt(token: string) {
  const parts = token.trim().split('.')

  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error('JWT 必须包含标头、载荷和签名片段')
  }

  return parts as [string, string, string]
}

async function importHmacKey(secret: string, algorithm: JwtAlgorithm, usages: KeyUsage[]) {
  return crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    {
      name: 'HMAC',
      hash: algorithmToHash[algorithm],
    },
    false,
    usages,
  )
}

function validateSecret(secret: string) {
  return secret.length > 0 ? undefined : 'JWT 密钥不能为空。'
}

export async function signJwt(input: JwtSignInput): Promise<JwtSignResult> {
  if (!isJwtAlgorithm(input.algorithm)) {
    return {
      ok: false,
      message: `不支持的 JWT 签名算法：${input.algorithm}`,
    }
  }

  const secretError = validateSecret(input.secret)

  if (secretError) {
    return {
      ok: false,
      message: secretError,
    }
  }

  try {
    const header = {
      typ: 'JWT',
      ...input.header,
      alg: input.algorithm,
    }
    const encodedHeader = encodeJsonSegment(header)
    const encodedPayload = encodeJsonSegment(input.payload)
    const signingInput = `${encodedHeader}.${encodedPayload}`
    const key = await importHmacKey(input.secret, input.algorithm, ['sign'])
    const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(signingInput))

    return {
      ok: true,
      token: `${signingInput}.${bytesToBase64Url(new Uint8Array(signature))}`,
      algorithm: input.algorithm,
      header,
      payload: input.payload,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'JWT 签名失败。',
    }
  }
}

export async function verifyJwtSignature(token: string, secret: string): Promise<JwtVerifyResult> {
  const secretError = validateSecret(secret)

  if (secretError) {
    return {
      ok: false,
      message: secretError,
    }
  }

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = splitJwt(token)
    const header = decodeJsonSegment(encodedHeader)
    const payload = decodeJsonSegment(encodedPayload)

    if (!isRecord(header)) {
      return {
        ok: false,
        message: 'JWT 标头必须是 JSON 对象。',
      }
    }

    const algorithm = typeof header.alg === 'string' ? header.alg : ''

    if (!isJwtAlgorithm(algorithm)) {
      return {
        ok: false,
        message: `不支持的 JWT 签名算法：${algorithm || 'unknown'}`,
      }
    }

    const key = await importHmacKey(secret, algorithm, ['verify'])
    const verified = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(encodedSignature),
      textEncoder.encode(`${encodedHeader}.${encodedPayload}`),
    )

    return {
      ok: true,
      verified,
      algorithm,
      header,
      payload,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'JWT 验签失败。',
    }
  }
}
