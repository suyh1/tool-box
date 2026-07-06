import { describe, expect, it } from 'vitest'
import { generateQrCode } from './qr-code'

describe('qr code generator utilities', () => {
  it('generates SVG QR codes', async () => {
    await expect(generateQrCode('https://example.com', { format: 'svg', margin: 2 })).resolves.toMatchObject({
      ok: true,
      format: 'svg',
      text: 'https://example.com',
      output: expect.stringContaining('<svg'),
      version: expect.any(Number),
    })
  })

  it('generates PNG data URL QR codes', async () => {
    const result = await generateQrCode('toolbox', { format: 'dataUrl', margin: 1 })

    expect(result).toMatchObject({
      ok: true,
      format: 'dataUrl',
      output: expect.stringMatching(/^data:image\/png;base64,/),
    })
  })

  it('returns readable errors for empty QR input', async () => {
    await expect(generateQrCode('')).resolves.toEqual({
      ok: false,
      message: '请输入要编码的内容。',
    })
  })
})
