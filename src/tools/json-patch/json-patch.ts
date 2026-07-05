import { parseJson } from '@/tools/json/json'

export type JsonPatchOperation =
  | { op: 'add'; path: string; value: unknown }
  | { op: 'remove'; path: string }
  | { op: 'replace'; path: string; value: unknown }

function parseJsonOrThrow(input: string, label: string) {
  const result = parseJson(input)

  if (!result.ok) {
    throw new Error(`${label} ${result.message}`)
  }

  return result.value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function valuesEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function escapePointerSegment(segment: string) {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1')
}

function appendPointer(path: string, segment: string) {
  return `${path}/${escapePointerSegment(segment)}`
}

function diffValues(before: unknown, after: unknown, path: string, operations: JsonPatchOperation[]) {
  if (valuesEqual(before, after)) {
    return
  }

  if (!isRecord(before) || !isRecord(after)) {
    operations.push({
      op: 'replace',
      path: path || '/',
      value: after,
    })
    return
  }

  for (const key of Object.keys(before)) {
    if (!(key in after)) {
      operations.push({
        op: 'remove',
        path: appendPointer(path, key),
      })
    }
  }

  for (const key of Object.keys(after)) {
    const childPath = appendPointer(path, key)

    if (!(key in before)) {
      operations.push({
        op: 'add',
        path: childPath,
        value: after[key],
      })
      continue
    }

    diffValues(before[key], after[key], childPath, operations)
  }
}

export function createJsonPatch(beforeInput: string, afterInput: string) {
  const before = parseJsonOrThrow(beforeInput, '原始 JSON')
  const after = parseJsonOrThrow(afterInput, '目标 JSON')
  const operations: JsonPatchOperation[] = []

  diffValues(before, after, '', operations)

  return operations
}

function createMergePatchValue(before: unknown, after: unknown): unknown {
  if (valuesEqual(before, after)) {
    return undefined
  }

  if (!isRecord(before) || !isRecord(after)) {
    return after
  }

  const patch: Record<string, unknown> = {}

  for (const key of Object.keys(before)) {
    if (!(key in after)) {
      patch[key] = null
    }
  }

  for (const key of Object.keys(after)) {
    const childPatch = createMergePatchValue(before[key], after[key])

    if (childPatch !== undefined) {
      patch[key] = childPatch
    }
  }

  return Object.keys(patch).length > 0 ? patch : undefined
}

export function createMergePatch(beforeInput: string, afterInput: string) {
  const before = parseJsonOrThrow(beforeInput, '原始 JSON')
  const after = parseJsonOrThrow(afterInput, '目标 JSON')
  const patch = createMergePatchValue(before, after)

  return patch ?? {}
}

export function createJsonPatchString(beforeInput: string, afterInput: string) {
  return JSON.stringify(createJsonPatch(beforeInput, afterInput), null, 2)
}

export function createMergePatchString(beforeInput: string, afterInput: string) {
  return JSON.stringify(createMergePatch(beforeInput, afterInput), null, 2)
}
