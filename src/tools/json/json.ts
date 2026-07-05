export type JsonKind = 'array' | 'object' | 'string' | 'number' | 'boolean' | 'null'

export type JsonParseResult =
  | {
      ok: true
      value: unknown
      kind: JsonKind
      size: number | null
    }
  | {
      ok: false
      message: string
    }

function getJsonKind(value: unknown): JsonKind {
  if (Array.isArray(value)) {
    return 'array'
  }

  if (value === null) {
    return 'null'
  }

  return typeof value as 'object' | 'string' | 'number' | 'boolean'
}

function getJsonSize(value: unknown) {
  if (Array.isArray(value)) {
    return value.length
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).length
  }

  return null
}

export function parseJson(input: string): JsonParseResult {
  try {
    const value = JSON.parse(input)

    return {
      ok: true,
      value,
      kind: getJsonKind(value),
      size: getJsonSize(value),
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : '未知解析错误'

    return {
      ok: false,
      message: `JSON 无效：${reason}`,
    }
  }
}

export function formatJson(input: string) {
  const result = parseJson(input)

  if (!result.ok) {
    throw new Error(result.message)
  }

  return JSON.stringify(result.value, null, 2)
}

export function minifyJson(input: string) {
  const result = parseJson(input)

  if (!result.ok) {
    throw new Error(result.message)
  }

  return JSON.stringify(result.value)
}
