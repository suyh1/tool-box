import { describe, expect, it } from 'vitest'
import { parseHttpHeaders } from './http-headers'

describe('parseHttpHeaders', () => {
  it('parses status/request line and repeated headers', () => {
    expect(parseHttpHeaders('HTTP/1.1 200 OK\\nContent-Type: application/json\\nSet-Cookie: a=1\\nSet-Cookie: b=2')).toEqual({
      startLine: 'HTTP/1.1 200 OK',
      headers: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Set-Cookie', value: 'a=1' },
        { name: 'Set-Cookie', value: 'b=2' },
      ],
      object: {
        'content-type': ['application/json'],
        'set-cookie': ['a=1', 'b=2'],
      },
    })
  })
})
