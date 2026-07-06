import { describe, expect, it } from 'vitest'
import { convertColor } from './color'

describe('color converter utilities', () => {
  it('converts hex colors to RGB, HSL, and OKLCH', () => {
    const result = convertColor('#336699')

    expect(result).toMatchObject({
      ok: true,
      hex: '#336699',
      rgb: { r: 51, g: 102, b: 153 },
      hsl: { h: 210, s: 50, l: 40 },
    })

    if (!result.ok) {
      throw new Error(result.message)
    }

    expect(result.oklch.l).toBeGreaterThan(0)
    expect(result.oklch.c).toBeGreaterThanOrEqual(0)
  })

  it('parses rgb and hsl color strings', () => {
    expect(convertColor('rgb(255, 0, 0)')).toMatchObject({
      ok: true,
      hex: '#ff0000',
      hsl: { h: 0, s: 100, l: 50 },
    })

    expect(convertColor('hsl(120 100% 25%)')).toMatchObject({
      ok: true,
      hex: '#008000',
      rgb: { r: 0, g: 128, b: 0 },
    })
  })

  it('parses oklch color strings', () => {
    const result = convertColor('oklch(62.8% 0.258 29.2)')

    expect(result).toMatchObject({
      ok: true,
      hex: '#ff0000',
    })
  })

  it('returns readable errors for invalid colors', () => {
    expect(convertColor('not a color')).toEqual({
      ok: false,
      message: '请输入有效的 HEX、RGB、HSL 或 OKLCH 颜色。',
    })
  })
})
