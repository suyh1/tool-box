export interface EnvEntry {
  key: string
  value: string
  line: number
}

export interface EnvParseResult {
  entries: EnvEntry[]
  object: Record<string, string>
  warnings: string[]
}

const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

function decodeEscape(sequence: string): string {
  if (sequence === 'n') return '\n'
  if (sequence === 'r') return '\r'
  if (sequence === 't') return '\t'
  return sequence
}

function readQuotedValue(rawValue: string, lineNumber: number): string {
  const quote = rawValue[0]
  let value = ''
  let escaped = false

  for (let index = 1; index < rawValue.length; index += 1) {
    const char = rawValue[index]

    if (quote === '"' && escaped) {
      value += decodeEscape(char)
      escaped = false
      continue
    }

    if (quote === '"' && char === '\\') {
      escaped = true
      continue
    }

    if (char === quote) {
      return value
    }

    value += char
  }

  throw new Error(`Invalid .env value on line ${lineNumber}: missing closing quote.`)
}

function stripInlineComment(value: string): string {
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '#' && index > 0 && /\s/.test(value[index - 1])) {
      return value.slice(0, index).trimEnd()
    }
  }

  return value.trim()
}

function parseValue(rawValue: string, lineNumber: number): string {
  const value = rawValue.trim()

  if (!value) {
    return ''
  }

  if (value.startsWith('"') || value.startsWith('\'')) {
    return readQuotedValue(value, lineNumber)
  }

  return stripInlineComment(value)
}

export function parseEnv(input: string): EnvParseResult {
  const entries: EnvEntry[] = []
  const object: Record<string, string> = {}
  const warnings: string[] = []
  const seen = new Set<string>()

  input.replace(/\r\n?/g, '\n').split('\n').forEach((line, index) => {
    const lineNumber = index + 1
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      return
    }

    const assignment = trimmed.startsWith('export ') ? trimmed.slice(7).trimStart() : trimmed
    const separatorIndex = assignment.indexOf('=')

    if (separatorIndex === -1) {
      throw new Error(`Invalid .env assignment on line ${lineNumber}: missing "=".`)
    }

    const key = assignment.slice(0, separatorIndex).trim()
    if (!ENV_KEY_PATTERN.test(key)) {
      throw new Error(`Invalid .env variable name on line ${lineNumber}: ${key}`)
    }

    if (seen.has(key)) {
      warnings.push(`line ${lineNumber}: "${key}" overrides an earlier value.`)
    }
    seen.add(key)

    const value = parseValue(assignment.slice(separatorIndex + 1), lineNumber)
    entries.push({ key, value, line: lineNumber })
    object[key] = value
  })

  return { entries, object, warnings }
}

export function envToJson(input: string): string {
  return JSON.stringify(parseEnv(input).object, null, 2)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stringifyJsonValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function quoteEnvValue(value: string): string {
  if (!value || /[\s#"\\\n\r\t]/.test(value)) {
    return `"${value
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/"/g, '\\"')}"`
  }

  return value
}

export function jsonToEnv(input: string): string {
  const value = JSON.parse(input) as unknown

  if (!isRecord(value)) {
    throw new Error('JSON 输入必须是对象。')
  }

  return Object.entries(value).map(([key, rawValue]) => {
    if (!ENV_KEY_PATTERN.test(key)) {
      throw new Error(`Invalid .env variable name: ${key}`)
    }

    return `${key}=${quoteEnvValue(stringifyJsonValue(rawValue))}`
  }).join('\n')
}
