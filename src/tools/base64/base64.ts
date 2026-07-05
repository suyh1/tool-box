export type DecodeResult = {
  ok: true
  value: string
} | {
  ok: false
  message: string
}

export function encodeBase64(input: string) {
  const bytes = new TextEncoder().encode(input)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

export function decodeBase64(input: string): DecodeResult {
  try {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(input) || input.length % 4 === 1) {
      throw new Error('Input is not valid Base64 text')
    }

    const binary = atob(input)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

    return {
      ok: true,
      value: new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to decode Base64 input',
    }
  }
}
