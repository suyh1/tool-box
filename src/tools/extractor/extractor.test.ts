import { describe, expect, it } from 'vitest'
import { extractEntities } from './extractor'

describe('extractEntities', () => {
  it('extracts unique URLs, emails, and IP addresses in input order', () => {
    const result = extractEntities('Email admin@example.com, visit https://example.com/a?b=1 or http://localhost:5173. IPs: 192.168.1.10 and 2001:db8::1 admin@example.com')

    expect(result.urls).toEqual(['https://example.com/a?b=1', 'http://localhost:5173'])
    expect(result.emails).toEqual(['admin@example.com'])
    expect(result.ipv4).toEqual(['192.168.1.10'])
    expect(result.ipv6).toEqual(['2001:db8::1'])
    expect(result.total).toBe(5)
  })
})
