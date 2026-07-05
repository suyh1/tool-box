import { describe, expect, it } from 'vitest'
import { formatJson, minifyJson, parseJson } from './json'

describe('json utilities', () => {
  it('formats valid JSON with two spaces', () => {
    expect(formatJson('{"name":"Toolbox","enabled":true}')).toBe('{\n  "name": "Toolbox",\n  "enabled": true\n}')
  })

  it('minifies valid JSON', () => {
    expect(minifyJson('{\n  "name": "Toolbox"\n}')).toBe('{"name":"Toolbox"}')
  })

  it('returns parse metadata for valid JSON', () => {
    expect(parseJson('[1,2,3]')).toEqual({
      ok: true,
      value: [1, 2, 3],
      kind: 'array',
      size: 3,
    })
  })

  it('returns a concise error for invalid JSON', () => {
    expect(parseJson('{"name":}')).toMatchObject({
      ok: false,
      message: expect.stringContaining('JSON 无效'),
    })
  })
})
