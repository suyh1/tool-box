export interface CsvTableOptions {
  delimiter?: string
  hasHeader?: boolean
  trimCells?: boolean
  skipEmptyRows?: boolean
}

export interface CsvTable {
  columns: string[]
  rows: string[][]
  rowCount: number
  columnCount: number
  warnings: string[]
}

interface CsvRecord {
  cells: string[]
  sourceLine: number
}

function normalizeDelimiter(delimiter: string) {
  if (delimiter.length === 0) {
    throw new Error('分隔符不能为空')
  }

  if (delimiter.length > 1) {
    throw new Error('分隔符必须是单个字符')
  }

  return delimiter
}

function normalizeCell(value: string, trimCells: boolean) {
  return trimCells ? value.trim() : value
}

function parseCsvRecords(input: string, delimiter: string, trimCells: boolean): CsvRecord[] {
  const records: CsvRecord[] = []
  let cells: string[] = []
  let value = ''
  let inQuotes = false
  let sourceLine = 1
  let recordLine = 1

  function pushCell() {
    cells.push(normalizeCell(value, trimCells))
    value = ''
  }

  function pushRecord() {
    pushCell()
    records.push({ cells, sourceLine: recordLine })
    cells = []
    recordLine = sourceLine
  }

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    const nextChar = input[index + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        value += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      pushCell()
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1
      }

      sourceLine += 1
      pushRecord()
      recordLine = sourceLine
      continue
    }

    if ((char === '\n' || char === '\r') && inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        value += '\n'
        index += 1
      } else {
        value += char
      }
      sourceLine += 1
      continue
    }

    value += char
  }

  if (inQuotes) {
    throw new Error('CSV 引号未闭合')
  }

  pushRecord()

  return records
}

function isEmptyRecord(record: CsvRecord) {
  return record.cells.every((cell) => cell.length === 0)
}

function uniqueColumnNames(headers: string[]) {
  const seen = new Map<string, number>()

  return headers.map((header, index) => {
    const baseName = header.trim() || `列 ${index + 1}`
    const count = (seen.get(baseName) ?? 0) + 1

    seen.set(baseName, count)

    return count === 1 ? baseName : `${baseName} (${count})`
  })
}

function generatedColumnNames(count: number) {
  return Array.from({ length: count }, (_, index) => `列 ${index + 1}`)
}

function normalizeRows(records: CsvRecord[], columnCount: number) {
  return records.map((record) => [
    ...record.cells,
    ...Array.from({ length: Math.max(0, columnCount - record.cells.length) }, () => ''),
  ])
}

export function parseCsvTable(input: string, options: CsvTableOptions = {}): CsvTable {
  const delimiter = normalizeDelimiter(options.delimiter ?? ',')
  const hasHeader = options.hasHeader ?? true
  const trimCells = options.trimCells ?? false
  const skipEmptyRows = options.skipEmptyRows ?? true
  const records = parseCsvRecords(input, delimiter, trimCells)
    .filter((record) => !skipEmptyRows || !isEmptyRecord(record))

  if (records.length === 0) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      columnCount: 0,
      warnings: [],
    }
  }

  const headerRecord = hasHeader ? records[0] : undefined
  const dataRecords = hasHeader ? records.slice(1) : records
  const expectedColumnCount = hasHeader
    ? headerRecord?.cells.length ?? 0
    : Math.max(...dataRecords.map((record) => record.cells.length))
  const actualColumnCount = Math.max(
    expectedColumnCount,
    ...dataRecords.map((record) => record.cells.length),
  )
  const rawColumns = hasHeader
    ? [
        ...(headerRecord?.cells ?? []),
        ...Array.from({ length: Math.max(0, actualColumnCount - expectedColumnCount) }, () => ''),
      ]
    : generatedColumnNames(actualColumnCount)
  const warnings = dataRecords
    .filter((record) => record.cells.length !== expectedColumnCount)
    .map((record) => `第 ${record.sourceLine} 行有 ${record.cells.length} 列，预期 ${expectedColumnCount} 列`)
  const columns = hasHeader ? uniqueColumnNames(rawColumns) : rawColumns
  const rows = normalizeRows(dataRecords, actualColumnCount)

  return {
    columns,
    rows,
    rowCount: rows.length,
    columnCount: columns.length,
    warnings,
  }
}

export function tableToTsv(table: CsvTable) {
  return [table.columns, ...table.rows]
    .map((row) => row.join('\t'))
    .join('\n')
}
