import { describe, expect, it } from 'vitest'
import { formatCss, minifyCss } from './css'

describe('css utilities', () => {
  it('formats CSS rules with declarations on separate lines', async () => {
    const result = await formatCss('.card{color:red;background:white}.card:hover{color:blue}')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain('.card {')
    expect(result.value).toContain('  color: red;')
    expect(result.value).toContain('.card:hover {')
    expect(result.meta).toBe('CSS 已格式化')
  })

  it('minifies CSS by removing comments and unnecessary whitespace', () => {
    expect(minifyCss('.card {\n  /* note */\n  color: red;\n  margin: 0  auto;\n}\n')).toEqual({
      ok: true,
      value: '.card{color:red;margin:0 auto}',
      meta: 'CSS 已压缩',
    })
  })

  it('keeps important comments while minifying', () => {
    expect(minifyCss('/*! license */\n.card { color: red; }')).toEqual({
      ok: true,
      value: '/*! license */.card{color:red}',
      meta: 'CSS 已压缩',
    })
  })

  it('rejects empty CSS input', async () => {
    expect(await formatCss('   ')).toEqual({
      ok: false,
      message: '请输入 CSS 内容。',
    })
    expect(minifyCss('   ')).toEqual({
      ok: false,
      message: '请输入 CSS 内容。',
    })
  })
})
