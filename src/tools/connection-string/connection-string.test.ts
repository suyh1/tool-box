import { describe, expect, it } from 'vitest'
import { parseConnectionString } from './connection-string'

describe('parseConnectionString', () => {
  it('parses database URLs into normalized connection parts', () => {
    expect(parseConnectionString('postgres://user:pass@localhost:5432/app?sslmode=require')).toEqual({
      ok: true,
      scheme: 'postgres',
      username: 'user',
      password: 'pass',
      host: 'localhost',
      port: '5432',
      database: 'app',
      params: { sslmode: 'require' },
      redacted: 'postgres://user:***@localhost:5432/app?sslmode=require',
    })
  })
})
