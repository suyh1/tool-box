import { describe, expect, it } from 'vitest'
import { buildRegexFromPreset, explainRegex } from './regex-helper'

describe('explainRegex', () => {
  it('explains anchors, named groups, character classes, and quantifiers', () => {
    const result = explainRegex('^(?<name>[A-Z][a-z]+)\\s+\\d{2,4}$')

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ token: '^', description: '匹配文本开头' }),
        expect.objectContaining({ token: '(?<name>', description: '开始名为 name 的捕获组' }),
        expect.objectContaining({ token: '[A-Z]', description: '字符集：A-Z' }),
        expect.objectContaining({ token: '\\s', description: '任意空白字符' }),
        expect.objectContaining({ token: '\\d', description: '任意数字' }),
        expect.objectContaining({ token: '{2,4}', description: '重复 2 到 4 次' }),
        expect.objectContaining({ token: '$', description: '匹配文本结尾' }),
      ]),
    )
  })

  it('reports invalid regex patterns', () => {
    expect(explainRegex('(')).toEqual({
      ok: false,
      message: expect.stringContaining('正则表达式无效'),
    })
  })
})

describe('buildRegexFromPreset', () => {
  it('returns common preset patterns with flags and sample text', () => {
    expect(buildRegexFromPreset('email')).toEqual({
      ok: true,
      pattern: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}',
      flags: 'gi',
      sample: 'admin@example.com',
    })
  })

  it('rejects unknown presets', () => {
    expect(buildRegexFromPreset('unknown')).toEqual({
      ok: false,
      message: '未知正则预设：unknown',
    })
  })
})
