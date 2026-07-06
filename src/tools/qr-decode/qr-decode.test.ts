import QRCode from 'qrcode'
import { describe, expect, it } from 'vitest'
import { decodeQrPixels } from './qr-decode'

function qrMatrixToPixels(text: string) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' })
  const scale = 8
  const margin = 4
  const moduleSize = qr.modules.size
  const width = (moduleSize + margin * 2) * scale
  const pixels = new Uint8ClampedArray(width * width * 4)

  for (let y = 0; y < width; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const moduleX = Math.floor(x / scale) - margin
      const moduleY = Math.floor(y / scale) - margin
      const dark = moduleX >= 0 && moduleY >= 0 && moduleX < moduleSize && moduleY < moduleSize
        ? qr.modules.get(moduleY, moduleX)
        : 0
      const value = dark ? 0 : 255
      const offset = (y * width + x) * 4
      pixels[offset] = value
      pixels[offset + 1] = value
      pixels[offset + 2] = value
      pixels[offset + 3] = 255
    }
  }

  return { pixels, width, height: width }
}

describe('qr decode utilities', () => {
  it('decodes QR pixel data', () => {
    const { pixels, width, height } = qrMatrixToPixels('hello toolbox')

    expect(decodeQrPixels(pixels, width, height)).toEqual({
      ok: true,
      data: 'hello toolbox',
      version: expect.any(Number),
    })
  })

  it('returns readable errors when no QR code is found', () => {
    const pixels = new Uint8ClampedArray(10 * 10 * 4).fill(255)

    expect(decodeQrPixels(pixels, 10, 10)).toEqual({
      ok: false,
      message: '未识别到 QR Code。',
    })
  })
})
