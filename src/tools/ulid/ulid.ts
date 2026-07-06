export interface GenerateUlidOptions {
  timestampMs?: number
  randomBytes?: (length: number) => Uint8Array
}

export type UlidResult =
  | {
      ok: true
      ulid: string
      timestampMs: number
      dateTime: string
    }
  | {
      ok: false
      message: string
    }

const ulidAlphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const ulidPattern = /^[0-9A-HJKMNP-TV-Z]{26}$/

function secureRandomBytes(length: number) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

function encodeBase32(value: bigint, length: number) {
  let encoded = ''
  let current = value

  for (let index = 0; index < length; index += 1) {
    encoded = ulidAlphabet[Number(current & 31n)] + encoded
    current >>= 5n
  }

  return encoded
}

function decodeBase32(value: string) {
  let decoded = 0n

  for (const character of value) {
    const index = ulidAlphabet.indexOf(character)

    if (index < 0) {
      return null
    }

    decoded = (decoded << 5n) | BigInt(index)
  }

  return decoded
}

export function generateUlid(options: GenerateUlidOptions = {}): UlidResult {
  const timestampMs = options.timestampMs ?? Date.now()

  if (!Number.isSafeInteger(timestampMs) || timestampMs < 0 || timestampMs > 281474976710655) {
    return {
      ok: false,
      message: 'ULID 时间戳必须是 0 到 2^48-1 的整数毫秒。',
    }
  }

  const random = (options.randomBytes ?? secureRandomBytes)(10)
  const randomValue = random.reduce((value, byte) => (value << 8n) | BigInt(byte), 0n)
  const ulid = `${encodeBase32(BigInt(timestampMs), 10)}${encodeBase32(randomValue, 16)}`

  return {
    ok: true,
    ulid,
    timestampMs,
    dateTime: new Date(timestampMs).toISOString(),
  }
}

export function parseUlid(input: string): UlidResult {
  const ulid = input.trim().toUpperCase()

  if (!ulidPattern.test(ulid)) {
    return {
      ok: false,
      message: 'ULID 必须是 26 位 Crockford Base32 字符。',
    }
  }

  const timestamp = decodeBase32(ulid.slice(0, 10))

  if (timestamp === null || timestamp > 281474976710655n) {
    return {
      ok: false,
      message: 'ULID 时间戳超出 48 位范围。',
    }
  }

  const timestampMs = Number(timestamp)

  return {
    ok: true,
    ulid,
    timestampMs,
    dateTime: new Date(timestampMs).toISOString(),
  }
}
