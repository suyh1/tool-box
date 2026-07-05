import { parseJson } from '@/tools/json/json'

type JsonPathToken =
  | { type: 'property'; key: string }
  | { type: 'index'; index: number }
  | { type: 'wildcard' }

export interface JsonPathMatch {
  path: string
  value: unknown
}

export interface JsonPathResult {
  matches: JsonPathMatch[]
  output: string
}

function parseJsonOrThrow(input: string) {
  const result = parseJson(input)

  if (!result.ok) {
    throw new Error(result.message)
  }

  return result.value
}

function appendPath(path: string, key: string | number) {
  if (typeof key === 'number') {
    return `${path}[${key}]`
  }

  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `${path}.${key}`
    : `${path}[${JSON.stringify(key)}]`
}

export function tokenizeJsonPath(expression: string): JsonPathToken[] {
  const path = expression.trim()

  if (!path.startsWith('$')) {
    throw new Error('JSONPath 必须以 $ 开始')
  }

  if (path.includes('..')) {
    throw new Error('暂不支持递归下降')
  }

  const tokens: JsonPathToken[] = []
  let index = 1

  while (index < path.length) {
    const char = path[index]

    if (char === '.') {
      if (path[index + 1] === '*') {
        tokens.push({ type: 'wildcard' })
        index += 2
        continue
      }

      const match = /^[A-Za-z_$][\w$]*/.exec(path.slice(index + 1))

      if (!match) {
        throw new Error(`JSONPath 点路径无效：${path.slice(index)}`)
      }

      tokens.push({ type: 'property', key: match[0] })
      index += match[0].length + 1
      continue
    }

    if (char === '[') {
      const closeIndex = path.indexOf(']', index)

      if (closeIndex === -1) {
        throw new Error('JSONPath 缺少 ]')
      }

      const content = path.slice(index + 1, closeIndex).trim()

      if (content === '*') {
        tokens.push({ type: 'wildcard' })
      } else if (/^\d+$/.test(content)) {
        tokens.push({ type: 'index', index: Number(content) })
      } else {
        const quoted = /^(['"])(.*)\1$/.exec(content)

        if (!quoted) {
          throw new Error(`JSONPath 括号路径无效：[${content}]`)
        }

        tokens.push({ type: 'property', key: quoted[2] })
      }

      index = closeIndex + 1
      continue
    }

    throw new Error(`JSONPath 语法无效：${path.slice(index)}`)
  }

  return tokens
}

function applyToken(matches: JsonPathMatch[], token: JsonPathToken) {
  const nextMatches: JsonPathMatch[] = []

  for (const match of matches) {
    if (token.type === 'property') {
      if (match.value && typeof match.value === 'object' && !Array.isArray(match.value) && token.key in match.value) {
        nextMatches.push({
          path: appendPath(match.path, token.key),
          value: (match.value as Record<string, unknown>)[token.key],
        })
      }
      continue
    }

    if (token.type === 'index') {
      if (Array.isArray(match.value) && token.index < match.value.length) {
        nextMatches.push({
          path: appendPath(match.path, token.index),
          value: match.value[token.index],
        })
      }
      continue
    }

    if (Array.isArray(match.value)) {
      match.value.forEach((value, childIndex) => {
        nextMatches.push({
          path: appendPath(match.path, childIndex),
          value,
        })
      })
    } else if (match.value && typeof match.value === 'object') {
      for (const [key, value] of Object.entries(match.value)) {
        nextMatches.push({
          path: appendPath(match.path, key),
          value,
        })
      }
    }
  }

  return nextMatches
}

export function queryJsonPath(input: string, expression: string): JsonPathResult {
  const value = parseJsonOrThrow(input)
  const tokens = tokenizeJsonPath(expression)
  const matches = tokens.reduce(applyToken, [{ path: '$', value }])

  return {
    matches,
    output: JSON.stringify(matches.map((match) => match.value), null, 2),
  }
}
