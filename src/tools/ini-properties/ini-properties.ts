import { parseJson } from '@/tools/json/json'

interface ConfigObject {
  [key: string]: string | ConfigObject
}

function parseJsonOrThrow(input: string) {
  const result = parseJson(input)

  if (!result.ok) {
    throw new Error(result.message)
  }

  return result.value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function setPath(root: ConfigObject, path: string[], value: string) {
  let target = root

  path.slice(0, -1).forEach((segment) => {
    if (!isRecord(target[segment])) {
      target[segment] = {}
    }

    target = target[segment] as ConfigObject
  })

  target[path[path.length - 1]] = value
}

function parseKeyValueLines(input: string, onPair: (key: string, value: string) => void) {
  input.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) {
      return
    }

    const separatorIndex = trimmed.search(/[:=]/)

    if (separatorIndex === -1) {
      throw new Error(`第 ${index + 1} 行缺少 = 或 :`)
    }

    onPair(trimmed.slice(0, separatorIndex).trim(), trimmed.slice(separatorIndex + 1).trim())
  })
}

export function iniToJson(input: string): ConfigObject {
  const root: ConfigObject = {}
  let section = ''

  input.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) {
      return
    }

    const sectionMatch = /^\[([^\]]+)]$/.exec(trimmed)

    if (sectionMatch) {
      section = sectionMatch[1]
      root[section] = isRecord(root[section]) ? root[section] : {}
      return
    }

    const separatorIndex = trimmed.search(/[:=]/)

    if (separatorIndex === -1) {
      throw new Error(`第 ${index + 1} 行缺少 = 或 :`)
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    if (section) {
      ;(root[section] as ConfigObject)[key] = value
    } else {
      root[key] = value
    }
  })

  return root
}

export function propertiesToJson(input: string): ConfigObject {
  const root: ConfigObject = {}

  parseKeyValueLines(input, (key, value) => {
    setPath(root, key.split('.'), value)
  })

  return root
}

function flattenProperties(value: Record<string, unknown>, prefix = ''): string[] {
  const lines: string[] = []

  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (isRecord(child)) {
      lines.push(...flattenProperties(child, path))
    } else {
      lines.push(`${path}=${String(child ?? '')}`)
    }
  }

  return lines
}

export function jsonToProperties(input: string) {
  const value = parseJsonOrThrow(input)

  if (!isRecord(value)) {
    throw new Error('JSON 必须是对象才能转换为 properties')
  }

  return flattenProperties(value).join('\n')
}

export function configToJsonString(value: ConfigObject) {
  return JSON.stringify(value, null, 2)
}
