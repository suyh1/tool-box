import { describe, expect, it } from 'vitest'
import { formatRedisCommand } from './redis-command'

describe('formatRedisCommand', () => {
  it('tokenizes Redis commands and builds RESP protocol preview', () => {
    expect(formatRedisCommand('SET user:1 "Ada Lovelace"')).toEqual({
      ok: true,
      tokens: ['SET', 'user:1', 'Ada Lovelace'],
      resp: '*3\r\n$3\r\nSET\r\n$6\r\nuser:1\r\n$12\r\nAda Lovelace\r\n',
    })
  })
})
