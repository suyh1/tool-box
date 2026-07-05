import { describe, expect, it } from 'vitest'
import { iniToJson, jsonToProperties, propertiesToJson } from './ini-properties'

describe('ini and properties utilities', () => {
  it('converts INI sections to JSON objects', () => {
    expect(iniToJson('[server]\nport=5173\nenabled=true\n\n[app]\nname=Toolbox')).toEqual({
      server: {
        port: '5173',
        enabled: 'true',
      },
      app: {
        name: 'Toolbox',
      },
    })
  })

  it('converts dotted properties to nested JSON objects', () => {
    expect(propertiesToJson('server.port=5173\nserver.enabled=true\napp.name=Toolbox')).toEqual({
      server: {
        port: '5173',
        enabled: 'true',
      },
      app: {
        name: 'Toolbox',
      },
    })
  })

  it('converts JSON objects to properties format', () => {
    expect(jsonToProperties('{"server":{"port":"5173","enabled":"true"},"app":{"name":"Toolbox"}}')).toBe([
      'server.port=5173',
      'server.enabled=true',
      'app.name=Toolbox',
    ].join('\n'))
  })
})
