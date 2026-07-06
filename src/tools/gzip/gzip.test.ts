import { describe, expect, it } from 'vitest'
import { compressTextToGzipBase64, decompressGzipBase64ToText } from './gzip'

describe('gzip utilities', () => {
  it('compresses UTF-8 text to Gzip base64 and decompresses it back', () => {
    const input = 'Hello 你好\nHello 你好\n'

    const compressed = compressTextToGzipBase64(input)

    expect(compressed).toMatchObject({
      ok: true,
      originalBytes: new TextEncoder().encode(input).length,
    })

    if (!compressed.ok) {
      throw new Error(compressed.message)
    }

    expect(compressed.value).toMatch(/^[A-Za-z0-9+/]+={0,2}$/)
    expect(compressed.compressedBytes).toBeGreaterThan(0)

    const decompressed = decompressGzipBase64ToText(compressed.value)

    expect(decompressed).toMatchObject({
      ok: true,
      value: input,
      compressedBytes: compressed.compressedBytes,
      outputBytes: compressed.originalBytes,
    })
  })

  it('returns a readable error for invalid compressed input', () => {
    expect(decompressGzipBase64ToText('not gzip')).toEqual({
      ok: false,
      message: '请输入有效的 Gzip Base64 内容。',
    })
  })
})
