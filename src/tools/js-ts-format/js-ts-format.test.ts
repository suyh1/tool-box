import { describe, expect, it } from 'vitest'
import { formatJavaScriptTypeScript } from './js-ts-format'

describe('javascript typescript formatter utilities', () => {
  it('formats JavaScript code without executing it', async () => {
    const result = await formatJavaScriptTypeScript('const value={name:"Ada"};function greet(){return value.name}', {
      language: 'javascript',
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain('const value = { name: "Ada" };')
    expect(result.value).toContain('function greet() {')
    expect(result.meta).toBe('JavaScript 已格式化')
  })

  it('formats TypeScript syntax with types preserved', async () => {
    const result = await formatJavaScriptTypeScript('type User={id:number;name:string}\nconst user:User={id:1,name:"Ada"}', {
      language: 'typescript',
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain('type User = {')
    expect(result.value).toContain('id: number;')
    expect(result.value).toContain('const user: User = { id: 1, name: "Ada" };')
    expect(result.meta).toBe('TypeScript 已格式化')
  })

  it('rejects empty source input', async () => {
    expect(await formatJavaScriptTypeScript('   ', {
      language: 'javascript',
    })).toEqual({
      ok: false,
      message: '请输入 JavaScript / TypeScript 内容。',
    })
  })
})
