import { describe, expect, it } from 'vitest'
import { csvToJson, jsonToCsv } from './csv-json'

describe('csv json utilities', () => {
  it('converts CSV rows with quoted commas to JSON objects', () => {
    expect(csvToJson('name,role,note\nAda,admin,"ships, fast"\nBob,editor,')).toEqual([
      {
        name: 'Ada',
        role: 'admin',
        note: 'ships, fast',
      },
      {
        name: 'Bob',
        role: 'editor',
        note: '',
      },
    ])
  })

  it('converts JSON object arrays to CSV with escaped values', () => {
    expect(jsonToCsv('[{"name":"Ada","note":"ships, fast"},{"name":"Bob","note":"He said \\"hi\\""}]')).toBe([
      'name,note',
      'Ada,"ships, fast"',
      'Bob,"He said ""hi"""',
    ].join('\n'))
  })

  it('rejects JSON that is not an object array', () => {
    expect(() => jsonToCsv('{"name":"Ada"}')).toThrow('JSON 必须是对象数组')
  })
})
