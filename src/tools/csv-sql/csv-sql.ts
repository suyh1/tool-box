import { parseCsvTable } from '@/tools/csv-table/csv-table'

export type SqlDialect = 'postgres' | 'mysql'

export interface CsvSqlOptions {
  tableName: string
  delimiter?: string
  hasHeader?: boolean
  trimCells?: boolean
  emptyAsNull?: boolean
  dialect?: SqlDialect
}

export type CsvSqlResult =
  | {
      ok: true
      value: string
      meta: string
    }
  | {
      ok: false
      message: string
    }

function quoteIdentifierPart(value: string, dialect: SqlDialect) {
  const quote = dialect === 'mysql' ? '`' : '"'
  const escaped = dialect === 'mysql'
    ? value.replace(/`/g, '``')
    : value.replace(/"/g, '""')

  return `${quote}${escaped}${quote}`
}

function quoteIdentifierPath(value: string, dialect: SqlDialect) {
  return value
    .split('.')
    .map((part) => quoteIdentifierPart(part.trim(), dialect))
    .join('.')
}

function normalizeColumnName(column: string, index: number) {
  const generatedColumn = /^列\s+(\d+)$/.exec(column)

  return generatedColumn ? `column_${generatedColumn[1]}` : column.trim() || `column_${index + 1}`
}

function sqlValue(value: string, emptyAsNull: boolean) {
  if (emptyAsNull && value === '') {
    return 'NULL'
  }

  return `'${value.replace(/'/g, "''")}'`
}

export function csvToInsertSql(input: string, options: CsvSqlOptions): CsvSqlResult {
  const tableName = options.tableName.trim()

  if (!tableName) {
    return {
      ok: false,
      message: '请输入表名。',
    }
  }

  try {
    const dialect = options.dialect ?? 'postgres'
    const hasHeader = options.hasHeader ?? true
    const table = parseCsvTable(input, {
      delimiter: options.delimiter ?? ',',
      hasHeader,
      trimCells: options.trimCells ?? true,
      skipEmptyRows: true,
    })

    if (table.rows.length === 0) {
      return {
        ok: false,
        message: 'CSV 中没有可生成 INSERT 的数据行。',
      }
    }

    const columns = hasHeader
      ? table.columns.map((column, index) => normalizeColumnName(column, index))
      : table.columns.map((_, index) => `column_${index + 1}`)
    const quotedTableName = quoteIdentifierPath(tableName, dialect)
    const quotedColumns = columns
      .map((column) => quoteIdentifierPart(column, dialect))
      .join(', ')
    const rows = table.rows.map((row, rowIndex) => {
      const values = row.map((cell) => sqlValue(cell, options.emptyAsNull ?? false)).join(', ')
      const suffix = rowIndex === table.rows.length - 1 ? ';' : ','

      return `  (${values})${suffix}`
    })

    return {
      ok: true,
      value: [
        `INSERT INTO ${quotedTableName} (${quotedColumns}) VALUES`,
        ...rows,
      ].join('\n'),
      meta: `已生成 ${table.rows.length} 行 INSERT`,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `CSV 解析失败：${error.message}` : 'CSV 解析失败',
    }
  }
}
