import { describe, expect, it } from 'vitest'
import { decodeHtmlEntities, encodeHtmlEntities } from './html-entity'

describe('html entity utilities', () => {
  it('encodes reserved HTML characters to named entities', () => {
    expect(encodeHtmlEntities('<span title="A&B">Tom\'s</span>')).toBe(
      '&lt;span title=&quot;A&amp;B&quot;&gt;Tom&apos;s&lt;/span&gt;',
    )
  })

  it('encodes non-ascii characters when requested', () => {
    expect(encodeHtmlEntities('你好 & ok', { encodeNonAscii: true })).toBe('&#x4F60;&#x597D; &amp; ok')
  })

  it('decodes named and numeric HTML entities', () => {
    expect(decodeHtmlEntities('&lt;div&gt;Tom&apos;s &#20320;&#x597D;&lt;/div&gt;')).toEqual({
      ok: true,
      value: '<div>Tom\'s 你好</div>',
    })
  })

  it('leaves unknown entities unchanged while decoding', () => {
    expect(decodeHtmlEntities('&unknown; &amp;')).toEqual({
      ok: true,
      value: '&unknown; &',
    })
  })

  it('rejects invalid numeric entities', () => {
    expect(decodeHtmlEntities('&#x110000;')).toEqual({
      ok: false,
      message: '无效的 HTML 数字实体：&#x110000;',
    })
  })
})
