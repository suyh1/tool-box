import { describe, expect, it } from 'vitest'
import { parseCsvTable, tableToTsv } from './csv-table'

describe('csv table viewer utilities', () => {
  it('builds a table with headers, quoted cells, and row statistics', () => {
    const table = parseCsvTable('name,role,note\nAda,admin,"ships, fast"\nBob,editor,', {
      delimiter: ',',
      hasHeader: true,
    })

    expect(table.columns).toEqual(['name', 'role', 'note'])
    expect(table.rows).toEqual([
      ['Ada', 'admin', 'ships, fast'],
      ['Bob', 'editor', ''],
    ])
    expect(table.rowCount).toBe(2)
    expect(table.columnCount).toBe(3)
    expect(table.warnings).toEqual([])
  })

  it('creates generated headers when the first row is data', () => {
    const table = parseCsvTable('Ada\tadmin\nBob\teditor', {
      delimiter: '\t',
      hasHeader: false,
    })

    expect(table.columns).toEqual(['列 1', '列 2'])
    expect(table.rows).toEqual([
      ['Ada', 'admin'],
      ['Bob', 'editor'],
    ])
  })

  it('normalizes duplicate and blank headers for stable table rendering', () => {
    const table = parseCsvTable('name,,name\nAda,42,Lovelace', {
      delimiter: ',',
      hasHeader: true,
    })

    expect(table.columns).toEqual(['name', '列 2', 'name (2)'])
    expect(table.rows).toEqual([['Ada', '42', 'Lovelace']])
  })

  it('pads short rows, preserves long rows, and reports uneven widths', () => {
    const table = parseCsvTable('name,role\nAda\nBob,editor,extra', {
      delimiter: ',',
      hasHeader: true,
    })

    expect(table.columns).toEqual(['name', 'role', '列 3'])
    expect(table.rows).toEqual([
      ['Ada', '', ''],
      ['Bob', 'editor', 'extra'],
    ])
    expect(table.warnings).toEqual([
      '第 2 行有 1 列，预期 2 列',
      '第 3 行有 3 列，预期 2 列',
    ])
  })

  it('rejects unterminated quoted fields', () => {
    expect(() => parseCsvTable('name,note\nAda,"unfinished', {
      delimiter: ',',
      hasHeader: true,
    })).toThrow('CSV 引号未闭合')
  })

  it('copies the parsed table as tab-separated text', () => {
    const table = parseCsvTable('name,note\nAda,"ships, fast"', {
      delimiter: ',',
      hasHeader: true,
    })

    expect(tableToTsv(table)).toBe('name\tnote\nAda\tships, fast')
  })
})
