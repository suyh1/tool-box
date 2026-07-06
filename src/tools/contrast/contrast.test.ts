import { describe, expect, it } from 'vitest'
import { checkContrast } from './contrast'

describe('checkContrast', () => {
  it('calculates WCAG contrast ratio and pass levels', () => {
    const result = checkContrast('#000000', '#ffffff')

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.ratio).toBe(21)
    expect(result.normalText).toEqual({ aa: true, aaa: true })
    expect(result.largeText).toEqual({ aa: true, aaa: true })
    expect(result.foreground.hex).toBe('#000000')
    expect(result.background.hex).toBe('#ffffff')
  })

  it('flags contrast that fails normal AA text', () => {
    const result = checkContrast('#777777', '#ffffff')

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.ratio).toBe(4.48)
    expect(result.normalText.aa).toBe(false)
    expect(result.largeText.aa).toBe(true)
  })

  it('returns a clear validation message for invalid colors', () => {
    expect(checkContrast('#000', 'wat')).toEqual({
      ok: false,
      message: '背景色无效：请输入有效的 HEX、RGB 或 HSL 颜色。',
    })
  })
})
