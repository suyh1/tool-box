import { describe, expect, it } from 'vitest'
import { csvToInsertSql } from './csv-sql'

describe('csv sql insert utilities', () => {
  it('converts CSV rows into a quoted multi-row INSERT statement', () => {
    const result = csvToInsertSql('id,name,note\n1,Ada,"ships, fast"\n2,Bob,"Bob\'s note"', {
      tableName: 'users',
      dialect: 'postgres',
      hasHeader: true,
    })

    expect(result).toEqual({
      ok: true,
      value: [
        'INSERT INTO "users" ("id", "name", "note") VALUES',
        "  ('1', 'Ada', 'ships, fast'),",
        "  ('2', 'Bob', 'Bob''s note');",
      ].join('\n'),
      meta: '已生成 2 行 INSERT',
    })
  })

  it('can map empty CSV fields to NULL values', () => {
    const result = csvToInsertSql('name,email\nAda,\nBob,bob@example.com', {
      tableName: 'users',
      emptyAsNull: true,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain("('Ada', NULL)")
    expect(result.value).toContain("('Bob', 'bob@example.com')")
  })

  it('generates column names when the CSV has no header row', () => {
    const result = csvToInsertSql('Ada,admin\nBob,editor', {
      tableName: 'user_roles',
      hasHeader: false,
    })

    expect(result).toEqual({
      ok: true,
      value: [
        'INSERT INTO "user_roles" ("column_1", "column_2") VALUES',
        "  ('Ada', 'admin'),",
        "  ('Bob', 'editor');",
      ].join('\n'),
      meta: '已生成 2 行 INSERT',
    })
  })

  it('supports MySQL identifier quoting', () => {
    const result = csvToInsertSql('select,value\none,1', {
      tableName: 'order lines',
      dialect: 'mysql',
    })

    expect(result).toEqual({
      ok: true,
      value: [
        'INSERT INTO `order lines` (`select`, `value`) VALUES',
        "  ('one', '1');",
      ].join('\n'),
      meta: '已生成 1 行 INSERT',
    })
  })

  it('rejects missing table names and empty data rows', () => {
    expect(csvToInsertSql('id,name\n1,Ada', {
      tableName: '   ',
    })).toEqual({
      ok: false,
      message: '请输入表名。',
    })

    expect(csvToInsertSql('id,name', {
      tableName: 'users',
    })).toEqual({
      ok: false,
      message: 'CSV 中没有可生成 INSERT 的数据行。',
    })
  })
})
