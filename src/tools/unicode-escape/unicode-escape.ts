export interface UnicodeEscapeEncodeOptions {
  encodeAscii?: boolean
}

export type UnicodeEscapeDecodeResult =
  | {
      ok: true
      value: string
    }
  | {
      ok: false
      message: string
    }

function toUnicodeEscape(codeUnit: number) {
  return `\\u${codeUnit.toString(16).toUpperCase().padStart(4, '0')}`
}

export function encodeUnicodeEscapes(input: string, options: UnicodeEscapeEncodeOptions = {}) {
  let output = ''

  for (let index = 0; index < input.length; index += 1) {
    const codeUnit = input.charCodeAt(index)
    const shouldEscape = options.encodeAscii || codeUnit > 0x7f

    output += shouldEscape ? toUnicodeEscape(codeUnit) : input[index]
  }

  return output
}

export function decodeUnicodeEscapes(input: string): UnicodeEscapeDecodeResult {
  const invalidEscape = /\\u(?![0-9a-fA-F]{4})....?/u.exec(input)

  if (invalidEscape) {
    return {
      ok: false,
      message: `无效的 Unicode 转义：${invalidEscape[0]}`,
    }
  }

  return {
    ok: true,
    value: input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16))),
  }
}
