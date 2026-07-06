import { describe, expect, it } from 'vitest'
import { envToJson, jsonToEnv, parseEnv } from './env-convert'

describe('env-convert', () => {
  it('parses comments, export prefixes, quotes, and inline comments', () => {
    const result = parseEnv(`
# local settings
export API_KEY='abc#123'
NAME=Toolbox # trailing comment
URL=https://example.com/path#fragment
QUOTED="line\\nnext"
EMPTY=
`)

    expect(result.object).toEqual({
      API_KEY: 'abc#123',
      NAME: 'Toolbox',
      URL: 'https://example.com/path#fragment',
      QUOTED: 'line\nnext',
      EMPTY: '',
    })
    expect(result.entries.map((entry) => entry.key)).toEqual(['API_KEY', 'NAME', 'URL', 'QUOTED', 'EMPTY'])
    expect(result.warnings).toEqual([])
  })

  it('converts env text to stable pretty JSON', () => {
    expect(envToJson('PORT=5173\nDEBUG=true')).toBe('{\n  "PORT": "5173",\n  "DEBUG": "true"\n}')
  })

  it('converts flat JSON values back to .env syntax with quoting when needed', () => {
    const output = jsonToEnv(JSON.stringify({
      PORT: 5173,
      DEBUG: true,
      NAME: 'Dev Toolbox',
      SECRET: 'abc#123',
      EMPTY: '',
    }))

    expect(output).toBe([
      'PORT=5173',
      'DEBUG=true',
      'NAME="Dev Toolbox"',
      'SECRET="abc#123"',
      'EMPTY=""',
    ].join('\n'))
  })

  it('rejects invalid variable names', () => {
    expect(() => parseEnv('1BAD=value')).toThrow('line 1')
  })
})
