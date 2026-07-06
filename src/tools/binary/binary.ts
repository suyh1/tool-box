export type BinaryDecodeResult =
  | {
      ok: true
      value: string
    }
  | {
      ok: false
      message: string
    }

function byteToBinary(byte: number) {
  return byte.toString(2).padStart(8, '0')
}

export function encodeTextToBinary(input: string) {
  return [...new TextEncoder().encode(input)]
    .map(byteToBinary)
    .join(' ')
}

export function decodeBinaryToText(input: string): BinaryDecodeResult {
  const compact = input.replace(/[\s:_-]/g, '')

  if (!/^[01]*$/.test(compact)) {
    return {
      ok: false,
      message: 'Binary 输入只能包含 0 和 1。',
    }
  }

  if (compact.length % 8 !== 0) {
    return {
      ok: false,
      message: 'Binary 输入必须按 8 位字节分组。',
    }
  }

  try {
    const bytes = Uint8Array.from(compact.match(/.{8}/g) ?? [], (byte) => Number.parseInt(byte, 2))

    return {
      ok: true,
      value: new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Binary 解码失败',
    }
  }
}
