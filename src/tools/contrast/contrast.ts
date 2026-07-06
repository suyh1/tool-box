import { convertColor, type RgbColor } from '../color/color'

export interface ContrastColor {
  hex: string
  rgb: RgbColor
  luminance: number
}

export interface ContrastPass {
  aa: boolean
  aaa: boolean
}

export type ContrastResult =
  | {
      ok: true
      ratio: number
      foreground: ContrastColor
      background: ContrastColor
      normalText: ContrastPass
      largeText: ContrastPass
    }
  | {
      ok: false
      message: string
    }

function round(value: number, digits = 2) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function srgbToLinear(component: number) {
  const value = component / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(rgb: RgbColor) {
  return round(
    0.2126 * srgbToLinear(rgb.r)
    + 0.7152 * srgbToLinear(rgb.g)
    + 0.0722 * srgbToLinear(rgb.b),
    5,
  )
}

function toContrastColor(input: string, label: string): ContrastColor | { message: string } {
  const color = convertColor(input)

  if (!color.ok) {
    return { message: `${label}无效：请输入有效的 HEX、RGB 或 HSL 颜色。` }
  }

  return {
    hex: color.hex,
    rgb: color.rgb,
    luminance: relativeLuminance(color.rgb),
  }
}

export function checkContrast(foregroundInput: string, backgroundInput: string): ContrastResult {
  const foreground = toContrastColor(foregroundInput, '前景色')
  if ('message' in foreground) {
    return { ok: false, message: foreground.message }
  }

  const background = toContrastColor(backgroundInput, '背景色')
  if ('message' in background) {
    return { ok: false, message: background.message }
  }

  const lighter = Math.max(foreground.luminance, background.luminance)
  const darker = Math.min(foreground.luminance, background.luminance)
  const ratio = round((lighter + 0.05) / (darker + 0.05))

  return {
    ok: true,
    ratio,
    foreground,
    background,
    normalText: {
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
    },
    largeText: {
      aa: ratio >= 3,
      aaa: ratio >= 4.5,
    },
  }
}
