export type StringEscapeMode = 'json' | 'javascript' | 'python' | 'sql'
export type StringEscapeOperation = 'escape' | 'unescape'

export interface StringEscapeOptions {
  mode: StringEscapeMode
  operation: StringEscapeOperation
}

export type StringEscapeResult =
  | {
      ok: true
      value: string
    }
  | {
      ok: false
      message: string
    }

function escapeJsonContent(input: string) {
  return JSON.stringify(input).slice(1, -1)
}

function unescapeJsonContent(input: string): StringEscapeResult {
  try {
    return { ok: true, value: JSON.parse(`"${input}"`) as string }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `字符串转义无效：${error.message}` : '字符串转义无效',
    }
  }
}

export function transformStringEscape(input: string, options: StringEscapeOptions): StringEscapeResult {
  if (options.mode === 'sql') {
    return {
      ok: true,
      value: options.operation === 'escape' ? input.replace(/'/g, "''") : input.replace(/''/g, "'"),
    }
  }

  if (options.operation === 'unescape') {
    return unescapeJsonContent(input)
  }

  if (options.mode === 'javascript') {
    return { ok: true, value: escapeJsonContent(input).replace(/'/g, "\\'") }
  }

  if (options.mode === 'python') {
    return { ok: true, value: escapeJsonContent(input).replace(/'/g, "\\'") }
  }

  return { ok: true, value: escapeJsonContent(input) }
}
