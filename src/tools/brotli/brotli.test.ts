import { describe, expect, it } from 'vitest'
import { compressTextToBrotliBase64, decompressBrotliBase64ToText } from './brotli'

describe('brotli utilities', () => {
  it('compresses UTF-8 text to Brotli base64 and decompresses it back', async () => {
    const input = 'Brotli 你好\nBrotli 你好\n'

    const compressed = await compressTextToBrotliBase64(input, { quality: 6 })

    expect(compressed).toMatchObject({
      ok: true,
      originalBytes: new TextEncoder().encode(input).length,
    })

    if (!compressed.ok) {
      throw new Error(compressed.message)
    }

    expect(compressed.value).toMatch(/^[A-Za-z0-9+/]+={0,2}$/)
    expect(compressed.compressedBytes).toBeGreaterThan(0)

    const decompressed = await decompressBrotliBase64ToText(compressed.value)

    expect(decompressed).toMatchObject({
      ok: true,
      value: input,
      compressedBytes: compressed.compressedBytes,
      outputBytes: compressed.originalBytes,
    })
  })

  it('returns a readable error for invalid Brotli input', async () => {
    await expect(decompressBrotliBase64ToText('not brotli')).resolves.toEqual({
      ok: false,
      message: '请输入有效的 Brotli Base64 内容。',
    })
  })
})
