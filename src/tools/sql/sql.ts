import { format } from 'sql-formatter'

export type SqlResult =
  | {
      ok: true
      value: string
      meta: string
    }
  | {
      ok: false
      message: string
    }

function requireSql(input: string): SqlResult | null {
  return input.trim()
    ? null
    : {
        ok: false,
        message: '请输入 SQL 内容。',
      }
}

export function formatSql(input: string): SqlResult {
  const empty = requireSql(input)

  if (empty) {
    return empty
  }

  try {
    return {
      ok: true,
      value: format(input, {
        keywordCase: 'upper',
      }),
      meta: 'SQL 已格式化',
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `SQL 格式化失败：${error.message}` : 'SQL 格式化失败',
    }
  }
}

export function minifySql(input: string): SqlResult {
  const empty = requireSql(input)

  if (empty) {
    return empty
  }

  return {
    ok: true,
    value: input
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim(),
    meta: 'SQL 已压缩',
  }
}
