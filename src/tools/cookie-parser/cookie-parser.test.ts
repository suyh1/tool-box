import { describe, expect, it } from 'vitest'
import { parseCookieHeader, parseSetCookieHeader } from './cookie-parser'

describe('cookie parser', () => {
  it('parses Cookie request headers', () => {
    expect(parseCookieHeader('sid=abc; theme=dark; empty=')).toEqual([
      { name: 'sid', value: 'abc' },
      { name: 'theme', value: 'dark' },
      { name: 'empty', value: '' },
    ])
  })

  it('parses Set-Cookie response headers with attributes', () => {
    expect(parseSetCookieHeader('sid=abc; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600')).toEqual({
      name: 'sid',
      value: 'abc',
      attributes: {
        path: '/',
        httponly: true,
        samesite: 'Lax',
        'max-age': '3600',
      },
    })
  })
})
