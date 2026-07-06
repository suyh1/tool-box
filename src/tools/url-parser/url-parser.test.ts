import { describe, expect, it } from 'vitest'
import { parseUrlDetails } from './url-parser'

describe('parseUrlDetails', () => {
  it('parses URL components and query parameters', () => {
    expect(parseUrlDetails('https://user:pass@example.com:8443/a/b?x=1&x=2&empty=#top')).toEqual({
      ok: true,
      protocol: 'https:',
      username: 'user',
      password: 'pass',
      host: 'example.com:8443',
      hostname: 'example.com',
      port: '8443',
      pathname: '/a/b',
      search: '?x=1&x=2&empty=',
      hash: '#top',
      origin: 'https://example.com:8443',
      query: {
        x: ['1', '2'],
        empty: [''],
      },
    })
  })

  it('returns validation errors for invalid URLs', () => {
    expect(parseUrlDetails('not a url')).toEqual({
      ok: false,
      message: '请输入有效 URL。',
    })
  })
})
