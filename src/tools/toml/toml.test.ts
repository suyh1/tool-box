import { describe, expect, it } from 'vitest'
import { formatToml, jsonToToml, tomlToJson } from './toml'

describe('toml utilities', () => {
  it('converts TOML sections to JSON objects', () => {
    expect(tomlToJson('title = "Toolbox"\n[server]\nport = 5173\nenabled = true')).toEqual({
      title: 'Toolbox',
      server: {
        port: 5173,
        enabled: true,
      },
    })
  })

  it('converts JSON objects to TOML sections', () => {
    expect(jsonToToml('{"title":"Toolbox","server":{"port":5173,"enabled":true}}')).toBe([
      'title = "Toolbox"',
      '',
      '[server]',
      'port = 5173',
      'enabled = true',
    ].join('\n'))
  })

  it('formats TOML with normalized spacing', () => {
    expect(formatToml('title="Toolbox"\n[server]\nport=5173')).toBe([
      'title = "Toolbox"',
      '',
      '[server]',
      'port = 5173',
    ].join('\n'))
  })
})
