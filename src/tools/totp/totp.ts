export const supportedTotpAlgorithms = ['SHA-1', 'SHA-256', 'SHA-512'] as const
export const supportedTotpDigits = [6, 7, 8] as const

export type TotpAlgorithm = typeof supportedTotpAlgorithms[number]
export type TotpDigits = typeof supportedTotpDigits[number]

export interface TotpOptions {
  timestamp?: number
  period?: number
  digits?: number
  algorithm?: string
}

export interface TotpVerifyOptions extends TotpOptions {
  window?: number
}

export type TotpGenerateResult =
  | {
      ok: true
      code: string
      counter: number
      remainingSeconds: number
      algorithm: TotpAlgorithm
      period: number
      digits: TotpDigits
    }
  | {
      ok: false
      message: string
    }

export type TotpVerifyResult =
  | {
      ok: true
      verified: true
      delta: number
    }
  | {
      ok: true
      verified: false
    }
  | {
      ok: false
      message: string
    }

const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function isTotpAlgorithm(value: string): value is TotpAlgorithm {
  return supportedTotpAlgorithms.includes(value as TotpAlgorithm)
}

function isTotpDigits(value: number): value is TotpDigits {
  return supportedTotpDigits.includes(value as TotpDigits)
}

function normalizeOptions(options: TotpOptions) {
  const algorithm = options.algorithm ?? 'SHA-1'
  const digits = options.digits ?? 6
  const period = options.period ?? 30

  if (!isTotpAlgorithm(algorithm)) {
    return {
      ok: false as const,
      message: `不支持的 TOTP 算法：${algorithm}`,
    }
  }

  if (!isTotpDigits(digits)) {
    return {
      ok: false as const,
      message: 'TOTP 位数必须是 6、7 或 8。',
    }
  }

  if (!Number.isInteger(period) || period < 1) {
    return {
      ok: false as const,
      message: 'TOTP period 必须是正整数秒。',
    }
  }

  return {
    ok: true as const,
    algorithm,
    digits,
    period,
    timestamp: options.timestamp ?? Date.now(),
  }
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

export function decodeBase32Secret(secret: string) {
  const normalized = secret.toUpperCase().replace(/[\s=-]/g, '')

  if (!normalized || /[^A-Z2-7]/.test(normalized)) {
    throw new Error('TOTP secret 必须是有效的 Base32。')
  }

  const bytes: number[] = []
  let bits = 0
  let value = 0

  for (const character of normalized) {
    value = (value << 5) | base32Alphabet.indexOf(character)
    bits += 5

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Uint8Array.from(bytes)
}

function counterToBytes(counter: number) {
  const bytes = new Uint8Array(8)
  let value = BigInt(counter)

  for (let index = 7; index >= 0; index -= 1) {
    bytes[index] = Number(value & 0xffn)
    value >>= 8n
  }

  return bytes
}

async function hmac(secret: Uint8Array, counter: number, algorithm: TotpAlgorithm) {
  const key = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(secret),
    {
      name: 'HMAC',
      hash: algorithm,
    },
    false,
    ['sign'],
  )

  return new Uint8Array(await crypto.subtle.sign('HMAC', key, toArrayBuffer(counterToBytes(counter))))
}

async function generateCodeForCounter(secret: Uint8Array, counter: number, algorithm: TotpAlgorithm, digits: TotpDigits) {
  const digest = await hmac(secret, counter, algorithm)
  const offset = digest[digest.length - 1] & 0x0f
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  const modulus = 10 ** digits

  return String(binary % modulus).padStart(digits, '0')
}

export async function generateTotp(secret: string, options: TotpOptions = {}): Promise<TotpGenerateResult> {
  const normalized = normalizeOptions(options)

  if (!normalized.ok) {
    return normalized
  }

  try {
    const secretBytes = decodeBase32Secret(secret)
    const counter = Math.floor(normalized.timestamp / 1000 / normalized.period)
    const elapsed = Math.floor(normalized.timestamp / 1000) % normalized.period

    return {
      ok: true,
      code: await generateCodeForCounter(secretBytes, counter, normalized.algorithm, normalized.digits),
      counter,
      remainingSeconds: normalized.period - elapsed,
      algorithm: normalized.algorithm,
      period: normalized.period,
      digits: normalized.digits,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'TOTP 生成失败。',
    }
  }
}

export async function verifyTotp(code: string, secret: string, options: TotpVerifyOptions = {}): Promise<TotpVerifyResult> {
  const normalized = normalizeOptions(options)

  if (!normalized.ok) {
    return normalized
  }

  const window = options.window ?? 1

  if (!Number.isInteger(window) || window < 0 || window > 10) {
    return {
      ok: false,
      message: 'TOTP window 必须是 0 到 10 的整数。',
    }
  }

  try {
    const secretBytes = decodeBase32Secret(secret)
    const counter = Math.floor(normalized.timestamp / 1000 / normalized.period)

    for (let delta = -window; delta <= window; delta += 1) {
      const candidate = await generateCodeForCounter(secretBytes, counter + delta, normalized.algorithm, normalized.digits)

      if (candidate === code.trim()) {
        return {
          ok: true,
          verified: true,
          delta: Object.is(delta, -0) ? 0 : delta,
        }
      }
    }

    return {
      ok: true,
      verified: false,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'TOTP 校验失败。',
    }
  }
}
