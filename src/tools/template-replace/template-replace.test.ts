import { describe, expect, it } from 'vitest'
import { parseTemplateRows, renderTemplateRows } from './template-replace'

describe('template replace', () => {
  it('parses JSON rows and renders placeholders for each row', () => {
    const rows = parseTemplateRows('[{"name":"Ada","id":1},{"name":"Linus","id":2}]')

    expect(rows.ok).toBe(true)
    if (!rows.ok) {
      return
    }

    expect(renderTemplateRows('user {{id}}: {{name}}', rows.rows)).toEqual({
      ok: true,
      output: 'user 1: Ada\nuser 2: Linus',
      missingKeys: [],
    })
  })

  it('reports missing keys without throwing', () => {
    expect(renderTemplateRows('Hello {{name}} {{role}}', [{ name: 'Ada' }])).toEqual({
      ok: true,
      output: 'Hello Ada ',
      missingKeys: ['role'],
    })
  })
})
