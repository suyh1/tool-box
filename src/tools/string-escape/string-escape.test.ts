import { describe, expect, it } from 'vitest'
import { transformStringEscape } from './string-escape'

describe('transformStringEscape', () => {
  it('escapes and unescapes JSON string content', () => {
    const escaped = transformStringEscape('Hello "Vue"\n工具箱', {
      mode: 'json',
      operation: 'escape',
    })

    expect(escaped).toEqual({
      ok: true,
      value: 'Hello \\"Vue\\"\\n工具箱',
    })

    expect(transformStringEscape(escaped.ok ? escaped.value : '', {
      mode: 'json',
      operation: 'unescape',
    })).toEqual({
      ok: true,
      value: 'Hello "Vue"\n工具箱',
    })
  })

  it('escapes SQL string literals by doubling single quotes', () => {
    expect(transformStringEscape("O'Reilly", {
      mode: 'sql',
      operation: 'escape',
    })).toEqual({
      ok: true,
      value: "O''Reilly",
    })
  })
})
