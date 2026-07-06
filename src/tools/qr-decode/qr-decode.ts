import jsQR from 'jsqr'

export type DecodeQrResult =
  | {
      ok: true
      data: string
      version: number
    }
  | {
      ok: false
      message: string
    }

export function decodeQrPixels(data: Uint8ClampedArray, width: number, height: number): DecodeQrResult {
  if (width < 1 || height < 1 || data.length < width * height * 4) {
    return {
      ok: false,
      message: '图像像素数据无效。',
    }
  }

  const result = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' })

  if (!result) {
    return {
      ok: false,
      message: '未识别到 QR Code。',
    }
  }

  return {
    ok: true,
    data: result.data,
    version: result.version,
  }
}
