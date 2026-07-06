export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface HslColor {
  h: number
  s: number
  l: number
}

export interface OklchColor {
  l: number
  c: number
  h: number
}

export type ColorConversionResult =
  | {
      ok: true
      hex: string
      rgb: RgbColor
      hsl: HslColor
      oklch: OklchColor
      css: {
        rgb: string
        hsl: string
        oklch: string
      }
    }
  | {
      ok: false
      message: string
    }

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function componentToHex(value: number) {
  return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0')
}

function rgbToHex(rgb: RgbColor) {
  return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`
}

function parseHex(input: string): RgbColor | null {
  const match = input.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)

  if (!match) {
    return null
  }

  const value = match[1]
  const hex = value.length === 3 ? [...value].map((character) => character + character).join('') : value

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

function parseRgb(input: string): RgbColor | null {
  const match = input.match(/^rgb\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*\)$/i)

  if (!match) {
    return null
  }

  const rgb = {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
  }

  if ([rgb.r, rgb.g, rgb.b].some((value) => !Number.isFinite(value) || value < 0 || value > 255)) {
    return null
  }

  return rgb
}

function hslToRgb(hsl: HslColor): RgbColor {
  const h = ((hsl.h % 360) + 360) % 360
  const s = hsl.s / 100
  const l = hsl.l / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function parseHsl(input: string): RgbColor | null {
  const match = input.match(/^hsl\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%\s*\)$/i)

  if (!match) {
    return null
  }

  const hsl = {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3]),
  }

  if (!Number.isFinite(hsl.h) || hsl.s < 0 || hsl.s > 100 || hsl.l < 0 || hsl.l > 100) {
    return null
  }

  return hslToRgb(hsl)
}

function srgbToLinear(value: number) {
  const normalized = value / 255
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(value: number) {
  const normalized = value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055
  return Math.round(clamp(normalized, 0, 1) * 255)
}

function rgbToHsl(rgb: RgbColor): HslColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))

    if (max === r) {
      h = 60 * (((g - b) / delta) % 6)
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2)
    } else {
      h = 60 * ((r - g) / delta + 4)
    }
  }

  return {
    h: Math.round((h + 360) % 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function rgbToOklch(rgb: RgbColor): OklchColor {
  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  const lRoot = Math.cbrt(l)
  const mRoot = Math.cbrt(m)
  const sRoot = Math.cbrt(s)
  const okL = 0.2104542553 * lRoot + 0.7936177850 * mRoot - 0.0040720468 * sRoot
  const okA = 1.9779984951 * lRoot - 2.4285922050 * mRoot + 0.4505937099 * sRoot
  const okB = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.8086757660 * sRoot
  const c = Math.sqrt(okA ** 2 + okB ** 2)
  const h = (Math.atan2(okB, okA) * 180 / Math.PI + 360) % 360

  return {
    l: round(okL, 4),
    c: round(c, 4),
    h: round(h, 2),
  }
}

function oklchToRgb(oklch: OklchColor): RgbColor {
  const a = oklch.c * Math.cos(oklch.h * Math.PI / 180)
  const b = oklch.c * Math.sin(oklch.h * Math.PI / 180)
  const lRoot = oklch.l + 0.3963377774 * a + 0.2158037573 * b
  const mRoot = oklch.l - 0.1055613458 * a - 0.0638541728 * b
  const sRoot = oklch.l - 0.0894841775 * a - 1.2914855480 * b
  const l = lRoot ** 3
  const m = mRoot ** 3
  const s = sRoot ** 3

  return {
    r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  }
}

function parseOklch(input: string): RgbColor | null {
  const match = input.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*\)$/i)

  if (!match) {
    return null
  }

  const lightness = match[1].endsWith('%') ? Number(match[1].slice(0, -1)) / 100 : Number(match[1])
  const chroma = Number(match[2])
  const hue = Number(match[3])

  if (!Number.isFinite(lightness) || !Number.isFinite(chroma) || !Number.isFinite(hue)) {
    return null
  }

  return oklchToRgb({ l: lightness, c: chroma, h: hue })
}

function parseColor(input: string): RgbColor | null {
  const normalized = input.trim()
  return parseHex(normalized) ?? parseRgb(normalized) ?? parseHsl(normalized) ?? parseOklch(normalized)
}

export function convertColor(input: string): ColorConversionResult {
  const rgb = parseColor(input)

  if (!rgb) {
    return {
      ok: false,
      message: '请输入有效的 HEX、RGB、HSL 或 OKLCH 颜色。',
    }
  }

  const normalizedRgb = {
    r: Math.round(clamp(rgb.r, 0, 255)),
    g: Math.round(clamp(rgb.g, 0, 255)),
    b: Math.round(clamp(rgb.b, 0, 255)),
  }
  const hsl = rgbToHsl(normalizedRgb)
  const oklch = rgbToOklch(normalizedRgb)

  return {
    ok: true,
    hex: rgbToHex(normalizedRgb),
    rgb: normalizedRgb,
    hsl,
    oklch,
    css: {
      rgb: `rgb(${normalizedRgb.r} ${normalizedRgb.g} ${normalizedRgb.b})`,
      hsl: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`,
      oklch: `oklch(${round(oklch.l * 100, 2)}% ${oklch.c} ${oklch.h})`,
    },
  }
}
