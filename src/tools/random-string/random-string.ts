export const randomStringPresets = {
  alphanumeric: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  hex: '0123456789abcdef',
  base64url: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_',
  numeric: '0123456789',
  custom: '',
} as const

export type RandomStringPreset = keyof typeof randomStringPresets

export interface GenerateRandomStringOptions {
  length?: number
  preset?: RandomStringPreset
  customAlphabet?: string
  randomBytes?: (length: number) => Uint8Array
}

export type GenerateRandomStringResult =
  | {
      ok: true
      value: string
      length: number
      alphabetSize: number
      preset: RandomStringPreset
    }
  | {
      ok: false
      message: string
    }

function secureRandomBytes(length: number) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

export function generateRandomString(options: GenerateRandomStringOptions = {}): GenerateRandomStringResult {
  const length = options.length ?? 32
  const preset = options.preset ?? 'alphanumeric'

  if (!Number.isInteger(length) || length < 1 || length > 4096) {
    return {
      ok: false,
      message: '长度必须是 1 到 4096 的整数。',
    }
  }

  const alphabet = preset === 'custom' ? options.customAlphabet ?? '' : randomStringPresets[preset]

  if (!alphabet) {
    return {
      ok: false,
      message: '自定义字符集不能为空。',
    }
  }

  const entropy = (options.randomBytes ?? secureRandomBytes)(length)
  const value = Array.from({ length }, (_, index) => alphabet[entropy[index] % alphabet.length]).join('')

  return {
    ok: true,
    value,
    length,
    alphabetSize: alphabet.length,
    preset,
  }
}
