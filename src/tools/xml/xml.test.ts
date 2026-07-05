import { describe, expect, it } from 'vitest'
import { formatXml, minifyXml, validateXml } from './xml'

describe('xml utilities', () => {
  it('formats XML with nested indentation', () => {
    expect(formatXml('<root><item id="1">Ada</item><empty /></root>')).toBe([
      '<root>',
      '  <item id="1">',
      '    Ada',
      '  </item>',
      '  <empty />',
      '</root>',
    ].join('\n'))
  })

  it('minifies XML by removing whitespace between tags', () => {
    expect(minifyXml('<root>\n  <item>Ada</item>\n</root>')).toBe('<root><item>Ada</item></root>')
  })

  it('validates malformed XML', () => {
    expect(validateXml('<root><item></root>')).toMatchObject({
      ok: false,
      message: expect.stringContaining('XML 无效'),
    })
  })
})
