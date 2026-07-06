import { describe, expect, it } from 'vitest'
import { buildQueryString, parseQueryString, setQueryParam } from './query-editor'

describe('query editor', () => {
  it('parses repeated query parameters', () => {
    expect(parseQueryString('?q=vue&tag=tool&tag=dev&empty=')).toEqual([
      { key: 'q', value: 'vue' },
      { key: 'tag', value: 'tool' },
      { key: 'tag', value: 'dev' },
      { key: 'empty', value: '' },
    ])
  })

  it('builds query strings and updates URL parameters', () => {
    expect(buildQueryString([
      { key: 'q', value: 'vue tools' },
      { key: 'page', value: '1' },
    ])).toBe('?q=vue+tools&page=1')

    expect(setQueryParam('https://example.com/search?q=old', 'q', 'new value')).toBe('https://example.com/search?q=new+value')
  })
})
