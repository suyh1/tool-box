import { parseJson, type JsonKind } from '@/tools/json/json'

export interface JsonOrganizeOptions {
  sortKeys?: boolean
  dedupeArrays?: boolean
}

export interface JsonOrganizeStats {
  sortedObjectCount: number
  dedupedArrayCount: number
  removedItemCount: number
}

export interface JsonOrganizeResult {
  output: string
  stats: JsonOrganizeStats
}

export interface JsonPathEntry {
  path: string
  kind: JsonKind
  depth: number
  preview: string
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getJsonKind(value: unknown): JsonKind {
  if (Array.isArray(value)) {
    return 'array'
  }

  if (value === null) {
    return 'null'
  }

  return typeof value as Exclude<JsonKind, 'array' | 'null'>
}

function sortKeys(keys: string[]) {
  return [...keys].sort((left, right) => left.localeCompare(right, 'en-US'))
}

function hasDifferentOrder(currentKeys: string[], sortedKeys: string[]) {
  return currentKeys.some((key, index) => key !== sortedKeys[index])
}

function canonicalize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(',')}]`
  }

  if (isPlainObject(value)) {
    return `{${sortKeys(Object.keys(value))
      .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
      .join(',')}}`
  }

  return JSON.stringify(value)
}

function organizeValue(value: unknown, options: JsonOrganizeOptions, stats: JsonOrganizeStats): unknown {
  if (Array.isArray(value)) {
    if (!options.dedupeArrays) {
      return value.map((item) => organizeValue(item, options, stats))
    }

    const seen = new Set<string>()
    const uniqueItems: unknown[] = []

    for (const item of value) {
      const signature = canonicalize(item)

      if (seen.has(signature)) {
        continue
      }

      seen.add(signature)
      uniqueItems.push(item)
    }

    const removedCount = value.length - uniqueItems.length

    if (removedCount > 0) {
      stats.dedupedArrayCount += 1
      stats.removedItemCount += removedCount
    }

    return uniqueItems.map((item) => organizeValue(item, options, stats))
  }

  if (!isPlainObject(value)) {
    return value
  }

  const currentKeys = Object.keys(value)
  const keys = options.sortKeys ? sortKeys(currentKeys) : currentKeys

  if (options.sortKeys && hasDifferentOrder(currentKeys, keys)) {
    stats.sortedObjectCount += 1
  }

  return Object.fromEntries(keys.map((key) => [key, organizeValue(value[key], options, stats)]))
}

function parseJsonOrThrow(input: string) {
  const result = parseJson(input)

  if (!result.ok) {
    throw new Error(result.message)
  }

  return result.value
}

export function organizeJson(input: string, options: JsonOrganizeOptions): JsonOrganizeResult {
  const stats: JsonOrganizeStats = {
    sortedObjectCount: 0,
    dedupedArrayCount: 0,
    removedItemCount: 0,
  }
  const organizedValue = organizeValue(parseJsonOrThrow(input), options, stats)

  return {
    output: JSON.stringify(organizedValue, null, 2),
    stats,
  }
}

function appendJsonPath(parentPath: string, key: string | number) {
  if (typeof key === 'number') {
    return `${parentPath}[${key}]`
  }

  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `${parentPath}.${key}`
    : `${parentPath}[${JSON.stringify(key)}]`
}

function previewValue(value: unknown) {
  if (Array.isArray(value)) {
    return `[${value.length} ${value.length === 1 ? 'item' : 'items'}]`
  }

  if (isPlainObject(value)) {
    const size = Object.keys(value).length

    return `{${size} ${size === 1 ? 'key' : 'keys'}}`
  }

  const preview = JSON.stringify(value)

  return preview.length > 72 ? `${preview.slice(0, 69)}...` : preview
}

function collectPathEntries(value: unknown, path: string, depth: number, entries: JsonPathEntry[]) {
  entries.push({
    path,
    kind: getJsonKind(value),
    depth,
    preview: previewValue(value),
  })

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectPathEntries(item, appendJsonPath(path, index), depth + 1, entries)
    })
    return
  }

  if (isPlainObject(value)) {
    for (const [key, childValue] of Object.entries(value)) {
      collectPathEntries(childValue, appendJsonPath(path, key), depth + 1, entries)
    }
  }
}

export function getJsonPathEntries(input: string) {
  const value = parseJsonOrThrow(input)
  const entries: JsonPathEntry[] = []

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectPathEntries(item, appendJsonPath('$', index), 1, entries)
    })
  } else if (isPlainObject(value)) {
    for (const [key, childValue] of Object.entries(value)) {
      collectPathEntries(childValue, appendJsonPath('$', key), 1, entries)
    }
  }

  return entries
}
