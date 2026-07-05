import { parseJson } from '@/tools/json/json'

type TomlValue = boolean | number | string | TomlValue[]

interface TomlObject {
  [key: string]: TomlValue | TomlObject
}

function parseJsonOrThrow(input: string) {
  const result = parseJson(input)

  if (!result.ok) {
    throw new Error(result.message)
  }

  return result.value
}

function parseValue(rawValue: string): TomlValue {
  const value = rawValue.trim()

  if (/^".*"$/.test(value)) {
    return JSON.parse(value)
  }

  if (value === 'true' || value === 'false') {
    return value === 'true'
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value)
  }

  if (/^\[.*\]$/.test(value)) {
    const content = value.slice(1, -1).trim()

    if (!content) {
      return []
    }

    return content.split(',').map((item) => parseValue(item.trim()))
  }

  throw new Error(`TOML 值无效：${rawValue}`)
}

function getSection(root: TomlObject, path: string[]) {
  let section = root

  for (const segment of path) {
    if (!section[segment] || typeof section[segment] !== 'object' || Array.isArray(section[segment])) {
      section[segment] = {}
    }

    section = section[segment] as TomlObject
  }

  return section
}

export function tomlToJson(input: string): TomlObject {
  const root: TomlObject = {}
  let currentPath: string[] = []

  input.split(/\r?\n/).forEach((line, lineIndex) => {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      return
    }

    const sectionMatch = /^\[([^\]]+)]$/.exec(trimmed)

    if (sectionMatch) {
      currentPath = sectionMatch[1].split('.').map((part) => part.trim())
      getSection(root, currentPath)
      return
    }

    const assignment = /^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/.exec(trimmed)

    if (!assignment) {
      throw new Error(`第 ${lineIndex + 1} 行 TOML 无效`)
    }

    getSection(root, currentPath)[assignment[1]] = parseValue(assignment[2])
  })

  return root
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => formatValue(item)).join(', ')}]`
  }

  throw new Error('TOML 只支持字符串、数字、布尔值和基础数组')
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function renderTomlObject(value: Record<string, unknown>, prefix = '') {
  const scalarLines: string[] = []
  const sectionLines: string[] = []

  for (const [key, child] of Object.entries(value)) {
    if (isPlainObject(child)) {
      const sectionName = prefix ? `${prefix}.${key}` : key
      const rendered = renderTomlObject(child, sectionName)
      sectionLines.push(`[${sectionName}]`, rendered)
    } else {
      scalarLines.push(`${key} = ${formatValue(child)}`)
    }
  }

  return [...scalarLines, ...sectionLines].filter(Boolean).join('\n')
}

export function jsonToToml(input: string) {
  const value = parseJsonOrThrow(input)

  if (!isPlainObject(value)) {
    throw new Error('JSON 必须是对象才能转换为 TOML')
  }

  return renderTomlObject(value).replace(/\n\[/g, '\n\n[')
}

export function formatToml(input: string) {
  return jsonToToml(JSON.stringify(tomlToJson(input)))
}

export function tomlToJsonString(input: string) {
  return JSON.stringify(tomlToJson(input), null, 2)
}
