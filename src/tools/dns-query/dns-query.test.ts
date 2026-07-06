import { describe, expect, it } from 'vitest'
import { buildDohUrl, normalizeDohResponse } from './dns-query'

describe('dns query helpers', () => {
  it('builds DNS-over-HTTPS query URLs', () => {
    expect(buildDohUrl({
      provider: 'cloudflare',
      name: 'example.com',
      type: 'A',
    })).toEqual({
      ok: true,
      url: 'https://cloudflare-dns.com/dns-query?name=example.com&type=A',
    })
  })

  it('normalizes DNS-over-HTTPS JSON responses', () => {
    expect(normalizeDohResponse({
      Status: 0,
      Answer: [
        { name: 'example.com.', type: 1, TTL: 300, data: '93.184.216.34' },
      ],
    })).toEqual({
      status: 0,
      answers: [
        { name: 'example.com.', type: 1, ttl: 300, data: '93.184.216.34' },
      ],
    })
  })
})
