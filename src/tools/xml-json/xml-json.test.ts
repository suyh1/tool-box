import { describe, expect, it } from 'vitest'
import { jsonToXml, xmlToJson } from './xml-json'

describe('xml json conversion utilities', () => {
  it('converts XML elements, attributes, and repeated children to JSON', () => {
    expect(xmlToJson('<user id="1"><name>Ada</name><role>admin</role><role>editor</role></user>')).toEqual({
      user: {
        '@id': '1',
        name: 'Ada',
        role: ['admin', 'editor'],
      },
    })
  })

  it('preserves mixed element text as #text', () => {
    expect(xmlToJson('<note priority="high">Ship it</note>')).toEqual({
      note: {
        '@priority': 'high',
        '#text': 'Ship it',
      },
    })
  })

  it('converts JSON objects with attributes and arrays to XML', () => {
    expect(jsonToXml('{"user":{"@id":"1","name":"Ada","role":["admin","editor"]}}')).toBe(
      '<user id="1"><name>Ada</name><role>admin</role><role>editor</role></user>',
    )
  })
})
