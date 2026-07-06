export type GraphqlFormatResult =
  | {
      ok: true
      output: string
    }
  | {
      ok: false
      message: string
    }

function splitFields(chunk: string) {
  return chunk.trim().split(/\s+/).filter(Boolean)
}

function tokenize(input: string) {
  const tokens: string[] = []
  let buffer = ''
  let parenDepth = 0

  for (const character of input.replace(/\s+/g, ' ').trim()) {
    if (character === '(') {
      parenDepth += 1
      buffer += character
      continue
    }

    if (character === ')') {
      parenDepth = Math.max(0, parenDepth - 1)
      buffer += character
      continue
    }

    if ((character === '{' || character === '}') && parenDepth === 0) {
      if (buffer.trim()) {
        tokens.push(buffer.trim())
      }

      tokens.push(character)
      buffer = ''
      continue
    }

    buffer += character
  }

  if (buffer.trim()) {
    tokens.push(buffer.trim())
  }

  return tokens
}

function isOperationHeader(value: string) {
  return /^(query|mutation|subscription|fragment)\b/u.test(value)
}

export function formatGraphql(input: string): GraphqlFormatResult {
  const tokens = tokenize(input)
  let depth = 0
  const lines: string[] = []

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    const next = tokens[index + 1]

    if (token === '{') {
      lines.push(`${'  '.repeat(depth)}{`)
      depth += 1
      continue
    }

    if (token === '}') {
      depth -= 1
      if (depth < 0) {
        return { ok: false, message: 'GraphQL 文档括号不平衡。' }
      }

      lines.push(`${'  '.repeat(depth)}}`)
      continue
    }

    if (next === '{') {
      if (isOperationHeader(token)) {
        lines.push(`${'  '.repeat(depth)}${token} {`)
      } else {
        const fields = splitFields(token)
        for (const field of fields.slice(0, -1)) {
          lines.push(`${'  '.repeat(depth)}${field}`)
        }

        lines.push(`${'  '.repeat(depth)}${fields.at(-1) ?? ''} {`)
      }

      depth += 1
      index += 1
      continue
    }

    for (const field of splitFields(token)) {
      lines.push(`${'  '.repeat(depth)}${field}`)
    }
  }

  if (depth !== 0) {
    return { ok: false, message: 'GraphQL 文档括号不平衡。' }
  }

  return { ok: true, output: lines.join('\n') }
}
