export const supportedHmacAlgorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const

export type HmacAlgorithm = typeof supportedHmacAlgorithms[number]

export type HmacResult =
  | {
      ok: true
      algorithm: HmacAlgorithm
      hex: string
      base64: string
    }
  | {
      ok: false
      message: string
    }

const textEncoder = new TextEncoder()

function isHmacAlgorithm(value: string): value is HmacAlgorithm {
  return supportedHmacAlgorithms.includes(value as HmacAlgorithm)
}

function toHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function toBase64(bytes: Uint8Array) {
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary)
}

export async function generateHmac(input: string, secret: string, algorithm: string): Promise<HmacResult> {
  if (!isHmacAlgorithm(algorithm)) {
    return {
      ok: false,
      message: `不支持的 HMAC 算法：${algorithm}`,
    }
  }

  if (!secret) {
    return {
      ok: false,
      message: 'HMAC 密钥不能为空。',
    }
  }

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      textEncoder.encode(secret),
      {
        name: 'HMAC',
        hash: algorithm,
      },
      false,
      ['sign'],
    )
    const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, textEncoder.encode(input)))

    return {
      ok: true,
      algorithm,
      hex: toHex(signature),
      base64: toBase64(signature),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'HMAC 生成失败。',
    }
  }
}
