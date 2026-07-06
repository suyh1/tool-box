import { convertColor, type HslColor, type RgbColor } from '../color/color'

export interface PaletteColor {
  name: string
  hex: string
  rgb: RgbColor
  hsl: HslColor
}

export type PaletteResult =
  | {
      ok: true
      base: string
      colors: PaletteColor[]
    }
  | {
      ok: false
      message: string
    }

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeHue(hue: number) {
  return ((hue % 360) + 360) % 360
}

function componentToHex(value: number) {
  return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0')
}

function rgbToHex(rgb: RgbColor) {
  return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`
}

function hslToRgb(hsl: HslColor): RgbColor {
  const h = normalizeHue(hsl.h)
  const s = clamp(hsl.s, 0, 100) / 100
  const l = clamp(hsl.l, 0, 100) / 100
  const chroma = (1 - Math.abs(2 * l - 1)) * s
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - chroma / 2
  let r = 0
  let g = 0
  let b = 0

  if (h < 60) {
    r = chroma
    g = x
  } else if (h < 120) {
    r = x
    g = chroma
  } else if (h < 180) {
    g = chroma
    b = x
  } else if (h < 240) {
    g = x
    b = chroma
  } else if (h < 300) {
    r = x
    b = chroma
  } else {
    r = chroma
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function rgbToHsl(rgb: RgbColor): HslColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const lightness = (max + min) / 2
  let hue = 0
  let saturation = 0

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1))

    if (max === r) {
      hue = 60 * (((g - b) / delta) % 6)
    } else if (max === g) {
      hue = 60 * ((b - r) / delta + 2)
    } else {
      hue = 60 * ((r - g) / delta + 4)
    }
  }

  return {
    h: Math.round(normalizeHue(hue)),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  }
}

function mixRgb(from: RgbColor, to: RgbColor, amount: number): RgbColor {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  }
}

function paletteColor(name: string, rgb: RgbColor): PaletteColor {
  const normalized = {
    r: Math.round(clamp(rgb.r, 0, 255)),
    g: Math.round(clamp(rgb.g, 0, 255)),
    b: Math.round(clamp(rgb.b, 0, 255)),
  }

  return {
    name,
    hex: rgbToHex(normalized),
    rgb: normalized,
    hsl: rgbToHsl(normalized),
  }
}

export function generatePalette(input: string): PaletteResult {
  const base = convertColor(input)

  if (!base.ok) {
    return {
      ok: false,
      message: '请输入有效的 HEX、RGB 或 HSL 颜色。',
    }
  }

  const colorFromHue = (name: string, hueOffset: number) => paletteColor(
    name,
    hslToRgb({
      ...base.hsl,
      h: normalizeHue(base.hsl.h + hueOffset),
    }),
  )

  return {
    ok: true,
    base: base.hex,
    colors: [
      paletteColor('Base', base.rgb),
      colorFromHue('Complementary', 180),
      colorFromHue('Analogous -30', -30),
      colorFromHue('Analogous +30', 30),
      colorFromHue('Triadic +120', 120),
      colorFromHue('Triadic +240', 240),
      paletteColor('Tint 30%', mixRgb(base.rgb, { r: 255, g: 255, b: 255 }, 0.3)),
      paletteColor('Tint 60%', mixRgb(base.rgb, { r: 255, g: 255, b: 255 }, 0.6)),
      paletteColor('Shade 30%', mixRgb(base.rgb, { r: 0, g: 0, b: 0 }, 0.3)),
      paletteColor('Shade 60%', mixRgb(base.rgb, { r: 0, g: 0, b: 0 }, 0.6)),
    ],
  }
}
