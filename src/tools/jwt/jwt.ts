export type JwtDecodeResult = {
  ok: true
  header: unknown
  payload: unknown
  signature: string
  verified: false
} | {
  ok: false
  message: string
}

function decodeBase64Url(part: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(part)) {
    throw new Error('Base64URL 片段无效')
  }

  const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

function parseJsonSegment(part: string) {
  return JSON.parse(decodeBase64Url(part)) as unknown
}

export function decodeJwt(token: string): JwtDecodeResult {
  const parts = token.trim().split('.')

  if (parts.length !== 3 || parts.some((part) => !part)) {
    return {
      ok: false,
      message: 'JWT 必须包含标头、载荷和签名片段',
    }
  }

  try {
    return {
      ok: true,
      header: parseJsonSegment(parts[0]),
      payload: parseJsonSegment(parts[1]),
      signature: parts[2],
      verified: false,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : '无法解码 JWT',
    }
  }
}
