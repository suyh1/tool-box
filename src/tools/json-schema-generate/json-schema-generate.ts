import { parseJson } from '@/tools/json/json'

type SchemaType = 'array' | 'boolean' | 'integer' | 'null' | 'number' | 'object' | 'string'

export interface GeneratedJsonSchema {
  $schema?: string
  type?: SchemaType | SchemaType[]
  required?: string[]
  properties?: Record<string, GeneratedJsonSchema>
  items?: GeneratedJsonSchema
}

function parseJsonOrThrow(input: string) {
  const result = parseJson(input)

  if (!result.ok) {
    throw new Error(result.message)
  }

  return result.value
}

function getValueType(value: unknown): SchemaType {
  if (Array.isArray(value)) {
    return 'array'
  }

  if (value === null) {
    return 'null'
  }

  if (Number.isInteger(value)) {
    return 'integer'
  }

  return typeof value as SchemaType
}

function uniqueTypes(types: Array<SchemaType | SchemaType[] | undefined>) {
  const values = types.flatMap((type) => Array.isArray(type) ? type : type ? [type] : [])

  return Array.from(new Set(values))
}

function normalizeType(types: SchemaType[]) {
  return types.length === 1 ? types[0] : types
}

function isObjectSchema(schema: GeneratedJsonSchema) {
  return schema.type === 'object'
}

function mergeSchemas(schemas: GeneratedJsonSchema[]): GeneratedJsonSchema {
  if (schemas.length === 0) {
    return {}
  }

  const types = uniqueTypes(schemas.map((schema) => schema.type))

  if (types.length === 1 && types[0] === 'object') {
    const allKeys = Array.from(new Set(schemas.flatMap((schema) => Object.keys(schema.properties ?? {}))))
    const required = allKeys.filter((key) => schemas.every((schema) => schema.required?.includes(key)))
    const properties = Object.fromEntries(allKeys.map((key) => {
      const childSchemas = schemas
        .filter(isObjectSchema)
        .map((schema) => schema.properties?.[key])
        .filter((schema): schema is GeneratedJsonSchema => Boolean(schema))

      return [key, mergeSchemas(childSchemas)]
    }))

    return {
      type: 'object',
      ...(required.length > 0 ? { required } : {}),
      properties,
    }
  }

  if (types.length === 1 && types[0] === 'array') {
    return {
      type: 'array',
      items: mergeSchemas(schemas.map((schema) => schema.items).filter((schema): schema is GeneratedJsonSchema => Boolean(schema))),
    }
  }

  return {
    type: normalizeType(types),
  }
}

function inferSchema(value: unknown): GeneratedJsonSchema {
  if (Array.isArray(value)) {
    return {
      type: 'array',
      items: mergeSchemas(value.map((item) => inferSchema(item))),
    }
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)

    return {
      type: 'object',
      required: entries.map(([key]) => key),
      properties: Object.fromEntries(entries.map(([key, child]) => [key, inferSchema(child)])),
    }
  }

  return {
    type: getValueType(value),
  }
}

export function generateJsonSchema(input: string): GeneratedJsonSchema {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    ...inferSchema(parseJsonOrThrow(input)),
  }
}

export function generateJsonSchemaString(input: string) {
  return JSON.stringify(generateJsonSchema(input), null, 2)
}
