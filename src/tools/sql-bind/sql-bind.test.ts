import { describe, expect, it } from 'vitest'
import { previewSqlBindings } from './sql-bind'

describe('previewSqlBindings', () => {
  it('binds positional parameters into a SQL preview with escaped literals', () => {
    expect(previewSqlBindings('select * from users where id = ? and name = ?', `[1,"Ada O'Neil"]`)).toEqual({
      ok: true,
      sql: "select * from users where id = 1 and name = 'Ada O''Neil'",
      consumed: 2,
      remaining: 0,
    })
  })

  it('reports invalid parameter JSON', () => {
    expect(previewSqlBindings('select ?', '{')).toEqual({
      ok: false,
      message: expect.stringContaining('参数 JSON 无效'),
    })
  })
})
