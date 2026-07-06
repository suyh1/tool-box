export interface NumberBaseSummary {
  binary: string
  octal: string
  decimal: string
  hexadecimal: string
}

export type NumberBaseResult =
  | {
      ok: true
      value: string
    }
  | {
      ok: false
      message: string
    }

export type NumberBaseSummaryResult =
  | {
      ok: true
      values: NumberBaseSummary
    }
  | {
      ok: false
      message: string
    }

function normalizeBase(base: number) {
  if (!Number.isInteger(base) || base < 2 || base > 36) {
    throw new Error('进制必须在 2 到 36 之间。')
  }

  return base
}

function digitValue(character: string) {
  const code = character.toLowerCase().codePointAt(0) ?? 0

  if (code >= 48 && code <= 57) return code - 48
  if (code >= 97 && code <= 122) return code - 87

  return -1
}

function parseBigInt(value: string, base: number) {
  const compact = value.trim().replace(/[_\s]/g, '')
  let sign = 1n
  let digits = compact

  if (digits.startsWith('-')) {
    sign = -1n
    digits = digits.slice(1)
  } else if (digits.startsWith('+')) {
    digits = digits.slice(1)
  }

  if (!digits) {
    throw new Error('请输入数字。')
  }

  let result = 0n

  for (const character of digits) {
    const digit = digitValue(character)

    if (digit < 0 || digit >= base) {
      throw new Error(`输入包含不属于 ${base} 进制的字符：${character}`)
    }

    result = result * BigInt(base) + BigInt(digit)
  }

  return result * sign
}

function convert(value: string, fromBase: number, toBase: number) {
  return parseBigInt(value, fromBase).toString(toBase)
}

export function convertNumberBase(value: string, fromBase: number, toBase: number): NumberBaseResult {
  try {
    return {
      ok: true,
      value: convert(value, normalizeBase(fromBase), normalizeBase(toBase)),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : '进制转换失败',
    }
  }
}

export function getNumberBaseSummary(value: string, fromBase: number): NumberBaseSummaryResult {
  try {
    const sourceBase = normalizeBase(fromBase)

    return {
      ok: true,
      values: {
        binary: convert(value, sourceBase, 2),
        octal: convert(value, sourceBase, 8),
        decimal: convert(value, sourceBase, 10),
        hexadecimal: convert(value, sourceBase, 16),
      },
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : '进制转换失败',
    }
  }
}
