export type RedisCommandResult =
  | {
      ok: true
      tokens: string[]
      resp: string
    }
  | {
      ok: false
      message: string
    }

function tokenizeRedisCommand(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | '' = ''
  let escaping = false

  for (const character of input.trim()) {
    if (escaping) {
      current += character
      escaping = false
      continue
    }

    if (character === '\\') {
      escaping = true
      continue
    }

    if ((character === '"' || character === "'") && !quote) {
      quote = character
      continue
    }

    if (character === quote) {
      quote = ''
      continue
    }

    if (/\s/u.test(character) && !quote) {
      if (current) {
        tokens.push(current)
        current = ''
      }
      continue
    }

    current += character
  }

  if (current) {
    tokens.push(current)
  }

  return tokens
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length
}

export function formatRedisCommand(input: string): RedisCommandResult {
  const tokens = tokenizeRedisCommand(input)

  if (tokens.length === 0) {
    return { ok: false, message: '请输入 Redis 命令。' }
  }

  return {
    ok: true,
    tokens,
    resp: `*${tokens.length}\r\n${tokens.map((token) => `$${byteLength(token)}\r\n${token}\r\n`).join('')}`,
  }
}
