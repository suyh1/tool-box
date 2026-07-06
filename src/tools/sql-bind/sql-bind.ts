export type SqlBindResult =
  | {
      ok: true
      sql: string
      consumed: number
      remaining: number
    }
  | {
      ok: false
      message: string
    }

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL'
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE'
  }

  if (Array.isArray(value)) {
    return `(${value.map(sqlLiteral).join(', ')})`
  }

  return `'${String(value).replace(/'/g, "''")}'`
}

export function previewSqlBindings(sql: string, paramsJson: string): SqlBindResult {
  let params: unknown

  try {
    params = JSON.parse(paramsJson)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `参数 JSON 无效：${error.message}` : '参数 JSON 无效',
    }
  }

  if (!Array.isArray(params)) {
    return { ok: false, message: '参数 JSON 必须是数组。' }
  }

  let index = 0
  const output = sql.replace(/\?/g, () => {
    if (index >= params.length) {
      return '?'
    }

    const value = sqlLiteral(params[index])
    index += 1
    return value
  })

  return {
    ok: true,
    sql: output,
    consumed: index,
    remaining: Math.max(0, params.length - index),
  }
}
