export type HexDecodeResult =
  | {
      ok: true
      value: string
    }
  | {
      ok: false
      message: string
    }

function bytesToHex(bytes: Uint8Array) {
  return [...bytes]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ')
}

export function encodeTextToHex(input: string) {
  return bytesToHex(new TextEncoder().encode(input))
}

export function decodeHexToText(input: string): HexDecodeResult {
  const compact = input.replace(/[\s:_-]/g, '').toLowerCase()

  if (compact.length % 2 !== 0) {
    return {
      ok: false,
      message: 'Hex 输入必须包含偶数个字符。',
    }
  }

  if (!/^[0-9a-f]*$/.test(compact)) {
    return {
      ok: false,
      message: 'Hex 输入只能包含 0-9 和 a-f。',
    }
  }

  try {
    const bytes = Uint8Array.from(compact.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16))

    return {
      ok: true,
      value: new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Hex 解码失败',
    }
  }
}
