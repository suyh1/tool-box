import { describe, expect, it } from 'vitest'
import { generatePalette } from './palette'

describe('generatePalette', () => {
  it('generates named harmony, tint, and shade colors from a base hex color', () => {
    const result = generatePalette('#336699')

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.base).toBe('#336699')
    expect(result.colors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Base', hex: '#336699' }),
        expect.objectContaining({ name: 'Complementary', hex: '#996633' }),
        expect.objectContaining({ name: 'Analogous -30', hex: '#339999' }),
        expect.objectContaining({ name: 'Analogous +30', hex: '#333399' }),
        expect.objectContaining({ name: 'Triadic +120', hex: '#993366' }),
        expect.objectContaining({ name: 'Tint 30%', hex: '#7094b8' }),
        expect.objectContaining({ name: 'Shade 30%', hex: '#24476b' }),
      ]),
    )
  })

  it('returns a validation message for unsupported color input', () => {
    expect(generatePalette('not a color')).toEqual({
      ok: false,
      message: '请输入有效的 HEX、RGB 或 HSL 颜色。',
    })
  })
})
