import { parseJson } from '@/tools/json/json'

type CsvRow = Record<string, string>

function parseJsonOrThrow(input: string) {
  const result = parseJson(input)

  if (!result.ok) {
    throw new Error(result.message)
  }

  return result.value
}

function parseCsvRows(input: string) {
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let inQuotes = false

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

    if (char === ',' && !inQuotes) {
      row.push(value)
      value = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1
      }

      row.push(value)
      rows.push(row)
      row = []
      value = ''
      continue
    }

    value += char
  }

  row.push(value)
  rows.push(row)

  return rows.filter((cells) => cells.some((cell) => cell.length > 0))
}

export function csvToJson(input: string): CsvRow[] {
  const rows = parseCsvRows(input)

  if (rows.length === 0) {
    return []
  }

  const [headers, ...records] = rows

  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ''])))
}

export function csvToJsonString(input: string) {
  return JSON.stringify(csvToJson(input), null, 2)
}

function escapeCsvValue(value: unknown) {
  const text = String(value ?? '')

  return /[",\n\r]/.test(text)
    ? `"${text.replace(/"/g, '""')}"`
    : text
}

export function jsonToCsv(input: string) {
  const value = parseJsonOrThrow(input)

  if (!Array.isArray(value) || value.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) {
    throw new Error('JSON 必须是对象数组')
  }

  const headers = Array.from(new Set(value.flatMap((item) => Object.keys(item as Record<string, unknown>))))
  const lines = [headers.join(',')]

  for (const item of value as Array<Record<string, unknown>>) {
    lines.push(headers.map((header) => escapeCsvValue(item[header])).join(','))
  }

  return lines.join('\n')
}
