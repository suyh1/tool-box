export type TemplateRow = Record<string, unknown>

export type TemplateRowsParseResult =
  | {
      ok: true
      rows: TemplateRow[]
    }
  | {
      ok: false
      message: string
    }

export type TemplateRenderResult =
  | {
      ok: true
      output: string
      missingKeys: string[]
    }
  | {
      ok: false
      message: string
    }

function isRecord(value: unknown): value is TemplateRow {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function parseTemplateRows(input: string): TemplateRowsParseResult {
  try {
    const parsed = JSON.parse(input) as unknown
    const rows = Array.isArray(parsed) ? parsed : [parsed]

    if (!rows.every(isRecord)) {
      return { ok: false, message: '模板数据必须是 JSON 对象或对象数组。' }
    }

    return { ok: true, rows }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `JSON 数据无效：${error.message}` : 'JSON 数据无效',
    }
  }
}

export function renderTemplateRows(template: string, rows: TemplateRow[]): TemplateRenderResult {
  const missing = new Set<string>()
  const output = rows.map((row) => template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key: string) => {
    const value = row[key]

    if (value === undefined || value === null) {
      missing.add(key)
      return ''
    }

    return String(value)
  })).join('\n')

  return {
    ok: true,
    output,
    missingKeys: [...missing],
  }
}
