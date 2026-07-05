import { describe, expect, it } from 'vitest'
import { queryXPath } from './xml-xpath'

describe('xml xpath utilities', () => {
  const xml = '<root><item id="1">Ada</item><item id="2">Bob</item></root>'

  it('queries text nodes with XPath', () => {
    expect(queryXPath(xml, '//item/text()').matches).toEqual([
      {
        kind: 'text',
        value: 'Ada',
      },
      {
        kind: 'text',
        value: 'Bob',
      },
    ])
  })

  it('queries attribute nodes with XPath', () => {
    expect(queryXPath(xml, '//@id').matches).toEqual([
      {
        kind: 'attribute',
        value: '1',
      },
      {
        kind: 'attribute',
        value: '2',
      },
    ])
  })

  it('reports malformed XML before XPath evaluation', () => {
    expect(() => queryXPath('<root><item></root>', '//item')).toThrow('XML 无效')
  })
})
