import { describe, expect, it } from 'vitest'
import { formatSql, minifySql } from './sql'

describe('sql utilities', () => {
  it('formats SQL queries', () => {
    const result = formatSql('select id,name from users where active=1 order by created_at desc')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain('SELECT')
    expect(result.value).toContain('FROM')
    expect(result.value).toContain('users')
    expect(result.value).toContain('ORDER BY')
    expect(result.meta).toBe('SQL 已格式化')
  })

  it('minifies SQL and removes comments', () => {
    const result = minifySql('SELECT *\n-- ignored\nFROM users\nWHERE active = 1')

    expect(result).toEqual({
      ok: true,
      value: 'SELECT * FROM users WHERE active = 1',
      meta: 'SQL 已压缩',
    })
  })

  it('rejects empty input', () => {
    expect(formatSql('   ')).toEqual({
      ok: false,
      message: '请输入 SQL 内容。',
    })
  })
})
