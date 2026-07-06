import QRCode from 'qrcode'
import type { QRCodeErrorCorrectionLevel } from 'qrcode'

export type QrCodeFormat = 'svg' | 'dataUrl'

export interface GenerateQrCodeOptions {
  format?: QrCodeFormat
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel
  margin?: number
  scale?: number
}

export type GenerateQrCodeResult =
  | {
      ok: true
      text: string
      output: string
      format: QrCodeFormat
      version: number
    }
  | {
      ok: false
      message: string
    }

export async function generateQrCode(text: string, options: GenerateQrCodeOptions = {}): Promise<GenerateQrCodeResult> {
  const normalized = text.trim()

  if (!normalized) {
    return {
      ok: false,
      message: '请输入要编码的内容。',
    }
  }

  try {
    const format = options.format ?? 'svg'
    const errorCorrectionLevel = options.errorCorrectionLevel ?? 'M'
    const margin = options.margin ?? 4
    const scale = options.scale ?? 6
    const version = QRCode.create(normalized, { errorCorrectionLevel }).version
    const output = format === 'dataUrl'
      ? await QRCode.toDataURL(normalized, { errorCorrectionLevel, margin, scale, type: 'image/png' })
      : await QRCode.toString(normalized, { errorCorrectionLevel, margin, type: 'svg' })

    return {
      ok: true,
      text: normalized,
      output,
      format,
      version,
    }
  } catch (error) {
    return {
      ok: false,
      message: `QR Code 生成失败：${error instanceof Error ? error.message : '未知错误'}`,
    }
  }
}
