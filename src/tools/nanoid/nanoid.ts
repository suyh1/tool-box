export const defaultNanoIdAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-'

export interface GenerateNanoIdOptions {
  length?: number
  alphabet?: string
  randomBytes?: (length: number) => Uint8Array
}

export type GenerateNanoIdResult =
  | {
      ok: true
      id: string
      length: number
      alphabetSize: number
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

export function generateNanoId(options: GenerateNanoIdOptions = {}): GenerateNanoIdResult {
  const length = options.length ?? 21
  const alphabet = options.alphabet ?? defaultNanoIdAlphabet

  if (!Number.isInteger(length) || length < 1 || length > 256) {
    return {
      ok: false,
      message: '长度必须是 1 到 256 的整数。',
    }
  }

  if (!alphabet) {
    return {
      ok: false,
      message: '字符集不能为空。',
    }
  }

  const entropy = (options.randomBytes ?? secureRandomBytes)(length)
  const id = Array.from({ length }, (_, index) => alphabet[entropy[index] % alphabet.length]).join('')

  return {
    ok: true,
    id,
    length,
    alphabetSize: alphabet.length,
  }
}
