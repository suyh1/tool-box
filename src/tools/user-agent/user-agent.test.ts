import { describe, expect, it } from 'vitest'
import { parseUserAgent } from './user-agent'

describe('parseUserAgent', () => {
  it('parses common browser, engine, OS, and device type metadata', () => {
    expect(parseUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36')).toEqual({
      browser: { name: 'Chrome', version: '123.0.0.0' },
      engine: { name: 'Blink', version: '537.36' },
      os: { name: 'macOS', version: '14.4' },
      device: { type: 'desktop', model: '' },
    })
  })
})
