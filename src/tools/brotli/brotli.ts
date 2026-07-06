import type { BrotliWasmType } from 'brotli-wasm'

export interface BrotliOptions {
  quality?: number
}

export type BrotliEncodeResult =
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

export type BrotliDecodeResult =
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
let brotliBackendPromise: Promise<BrotliWasmType> | undefined

async function loadNodeBrotli() {
  const nodeModuleSpecifier = 'node:module'
  const { createRequire } = (await import(/* @vite-ignore */ nodeModuleSpecifier)) as {
    createRequire: (url: string) => (id: string) => unknown
  }

  return createRequire(import.meta.url)('brotli-wasm') as BrotliWasmType
}

async function loadBrotli() {
  const shouldUseNodeBackend = import.meta.env.MODE === 'test' || import.meta.env.SSR

  brotliBackendPromise ??= shouldUseNodeBackend
    ? loadNodeBrotli()
    : import('brotli-wasm').then((module) => module.default)

  return brotliBackendPromise
}

function normalizeQuality(quality: number | undefined) {
  if (quality === undefined || !Number.isFinite(quality)) {
    return 6
  }

  return Math.min(11, Math.max(1, Math.round(quality)))
}

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

export async function compressTextToBrotliBase64(
  input: string,
  options: BrotliOptions = {},
): Promise<BrotliEncodeResult> {
  try {
    const brotli = await loadBrotli()
    const bytes = textEncoder.encode(input)
    const compressed = brotli.compress(bytes, { quality: normalizeQuality(options.quality) })

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
      message: error instanceof Error ? error.message : 'Brotli 压缩失败。',
    }
  }
}

export async function decompressBrotliBase64ToText(input: string): Promise<BrotliDecodeResult> {
  try {
    const brotli = await loadBrotli()
    const compressed = base64ToBytes(input)
    const output = brotli.decompress(compressed)

    return {
      ok: true,
      value: textDecoder.decode(output),
      compressedBytes: compressed.length,
      outputBytes: output.length,
    }
  } catch {
    return {
      ok: false,
      message: '请输入有效的 Brotli Base64 内容。',
    }
  }
}
