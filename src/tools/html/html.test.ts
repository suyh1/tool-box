import { describe, expect, it } from 'vitest'
import { formatHtml, minifyHtml } from './html'

describe('html utilities', () => {
  it('formats HTML markup with nested structure', async () => {
    const result = await formatHtml('<main><h1>Hello</h1><p data-id="1">World</p></main>')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain('<main>')
    expect(result.value).toContain('  <h1>Hello</h1>')
    expect(result.value).toContain('  <p data-id="1">World</p>')
    expect(result.meta).toBe('HTML 已格式化')
  })

  it('minifies HTML by removing comments and inter-tag whitespace', () => {
    expect(minifyHtml('<div>\n  <!-- note -->\n  <span> Hello </span>\n</div>')).toEqual({
      ok: true,
      value: '<div><span> Hello </span></div>',
      meta: 'HTML 已压缩',
    })
  })

  it('keeps conditional comments while minifying', () => {
    expect(minifyHtml('<div>\n<!--[if IE]>legacy<![endif]-->\n<span>ok</span>\n</div>')).toEqual({
      ok: true,
      value: '<div><!--[if IE]>legacy<![endif]--><span>ok</span></div>',
      meta: 'HTML 已压缩',
    })
  })

  it('rejects empty HTML input', async () => {
    expect(await formatHtml('   ')).toEqual({
      ok: false,
      message: '请输入 HTML 内容。',
    })
    expect(minifyHtml('   ')).toEqual({
      ok: false,
      message: '请输入 HTML 内容。',
    })
  })
})
