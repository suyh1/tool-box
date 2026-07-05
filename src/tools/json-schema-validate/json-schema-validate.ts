import { parseJson } from '@/tools/json/json'

type JsonSchemaType = 'array' | 'boolean' | 'integer' | 'null' | 'number' | 'object' | 'string'

interface JsonSchema {
  type?: JsonSchemaType | JsonSchemaType[]
  required?: string[]
  properties?: Record<string, JsonSchema>
  items?: JsonSchema
  enum?: unknown[]
  const?: unknown
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  additionalProperties?: boolean | JsonSchema
}

export interface JsonSchemaValidationError {
  path: string
  message: string
}

export interface JsonSchemaValidationResult {
  valid: boolean
  errors: JsonSchemaValidationError[]
}

function parseJsonOrThrow(input: string, label: string) {
  const result = parseJson(input)

  if (!result.ok) {
    throw new Error(`${label} ${result.message}`)
  }

  return result.value
}

function getType(value: unknown): JsonSchemaType {
  if (Array.isArray(value)) {
    return 'array'
  }

  if (value === null) {
    return 'null'
  }

  if (Number.isInteger(value)) {
    return 'integer'
  }

  return typeof value as JsonSchemaType
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function appendPath(path: string, key: string | number) {
  if (typeof key === 'number') {
    return `${path}[${key}]`
  }

  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `${path}.${key}`
    : `${path}[${JSON.stringify(key)}]`
}

function valuesEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function typeMatches(value: unknown, expected: JsonSchema['type']) {
  if (!expected) {
    return true
  }

  const allowedTypes = Array.isArray(expected) ? expected : [expected]
  const actual = getType(value)

  return allowedTypes.some((type) => type === actual || (type === 'number' && actual === 'integer'))
}

function addTypeError(errors: JsonSchemaValidationError[], path: string, expected: JsonSchema['type']) {
  const label = Array.isArray(expected) ? expected.join(' 或 ') : expected

  errors.push({
    path,
    message: `应为 ${label}`,
  })
}

function validateValue(value: unknown, schema: JsonSchema, path: string, errors: JsonSchemaValidationError[]) {
  if (!typeMatches(value, schema.type)) {
    addTypeError(errors, path, schema.type)
    return
  }

  if (schema.const !== undefined && !valuesEqual(value, schema.const)) {
    errors.push({ path, message: `应等于 ${JSON.stringify(schema.const)}` })
  }

  if (schema.enum && !schema.enum.some((item) => valuesEqual(item, value))) {
    errors.push({ path, message: `应为枚举值之一：${schema.enum.map((item) => JSON.stringify(item)).join(', ')}` })
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path, message: `应大于或等于 ${schema.minimum}` })
    }

    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({ path, message: `应小于或等于 ${schema.maximum}` })
    }
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({ path, message: `长度应至少为 ${schema.minLength}` })
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({ path, message: `长度应不超过 ${schema.maxLength}` })
    }

    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push({ path, message: `应匹配 /${schema.pattern}/` })
    }
  }

  if (Array.isArray(value) && schema.items) {
    value.forEach((item, index) => {
      validateValue(item, schema.items as JsonSchema, appendPath(path, index), errors)
    })
  }

  if (!isObject(value)) {
    return
  }

  for (const key of schema.required ?? []) {
    if (!(key in value)) {
      errors.push({
        path: appendPath(path, key),
        message: '缺少必填字段',
      })
    }
  }

  for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
    if (key in value) {
      validateValue(value[key], propertySchema, appendPath(path, key), errors)
    }
  }

  if (schema.additionalProperties === false) {
    const knownKeys = new Set(Object.keys(schema.properties ?? {}))

    for (const key of Object.keys(value)) {
      if (!knownKeys.has(key)) {
        errors.push({
          path: appendPath(path, key),
          message: '不允许额外字段',
        })
      }
    }
  }
}

export function validateJsonSchema(dataInput: string, schemaInput: string): JsonSchemaValidationResult {
  const data = parseJsonOrThrow(dataInput, '数据')
  const schema = parseJsonOrThrow(schemaInput, 'Schema') as JsonSchema
  const errors: JsonSchemaValidationError[] = []

  validateValue(data, schema, '$', errors)

  return {
    valid: errors.length === 0,
    errors,
  }
}
