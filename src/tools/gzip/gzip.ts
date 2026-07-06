import { gunzipSync, gzipSync } from 'fflate'

export type GzipEncodeResult =
  | {
      ok: true
      value: string
      originalBytes: number
      compressedBytes: number
      ratio: number
    }
  | {
      ok: false
      message: string
    }

export type GzipDecodeResult =
  | {
      ok: true
      value: string
      compressedBytes: number
      outputBytes: number
    }
  | {
      ok: false
      message: string
    }

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder('utf-8', { fatal: true })

function bytesToBase64(bytes: Uint8Array) {
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary)
}

function base64ToBytes(input: string) {
  const normalized = input.replace(/\s/g, '')

  if (normalized.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new Error('Invalid Base64')
  }

  const binary = atob(normalized)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export function compressTextToGzipBase64(input: string): GzipEncodeResult {
  try {
    const bytes = textEncoder.encode(input)
    const compressed = gzipSync(bytes)

    return {
      ok: true,
      value: bytesToBase64(compressed),
      originalBytes: bytes.length,
      compressedBytes: compressed.length,
      ratio: bytes.length === 0 ? 0 : compressed.length / bytes.length,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Gzip 压缩失败。',
    }
  }
}

export function decompressGzipBase64ToText(input: string): GzipDecodeResult {
  try {
    const compressed = base64ToBytes(input)
    const output = gunzipSync(compressed)

    return {
      ok: true,
      value: textDecoder.decode(output),
      compressedBytes: compressed.length,
      outputBytes: output.length,
    }
  } catch {
    return {
      ok: false,
      message: '请输入有效的 Gzip Base64 内容。',
    }
  }
}
