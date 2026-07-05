export type DecodeResult = {
  ok: true
  value: string
} | {
  ok: false
  message: string
}

export function encodeUrlComponent(input: string) {
  return encodeURIComponent(input)
}

export function decodeUrlComponent(input: string): DecodeResult {
  try {
    return {
      ok: true,
      value: decodeURIComponent(input),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to decode URL component',
    }
  }
}
