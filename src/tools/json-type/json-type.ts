export type JsonTypeTarget = 'typescript' | 'java' | 'go' | 'zod'

export type JsonTypeResult =
  | {
      ok: true
      value: string
      meta: string
    }
  | {
      ok: false
      message: string
    }

type PrimitiveKind = 'string' | 'number' | 'boolean' | 'null' | 'unknown'

type TypeNode =
  | { kind: PrimitiveKind }
  | { kind: 'array'; element: TypeNode }
  | { kind: 'object'; name: string; fields: FieldNode[] }
  | { kind: 'union'; types: TypeNode[] }

interface FieldNode {
  key: string
  optional: boolean
  type: TypeNode
}

const targetLabels: Record<JsonTypeTarget, string> = {
  typescript: 'TypeScript interface',
  java: 'Java class',
  go: 'Go struct',
  zod: 'Zod schema',
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function splitIdentifier(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function capitalize(input: string) {
  return input ? `${input.slice(0, 1).toUpperCase()}${input.slice(1)}` : ''
}

function toPascalCase(input: string, fallback = 'Root') {
  const words = splitIdentifier(input)

  if (words.length === 0) {
    return fallback
  }

  const value = words
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join('')

  return /^\d/.test(value) ? `${fallback}${value}` : value
}

function toCamelCase(input: string, fallback = 'value') {
  const pascal = toPascalCase(input, capitalize(fallback))
  const value = `${pascal.slice(0, 1).toLowerCase()}${pascal.slice(1)}`

  return /^\d/.test(value) ? `${fallback}${value}` : value
}

function toGoFieldName(input: string) {
  return toPascalCase(input, 'Field')
}

function singularize(input: string) {
  if (/ies$/i.test(input)) {
    return input.replace(/ies$/i, 'y')
  }

  if (/s$/i.test(input) && !/ss$/i.test(input)) {
    return input.slice(0, -1)
  }

  return input
}

function childTypeName(parentName: string, key: string, arrayItem = false) {
  const base = arrayItem ? singularize(key) : key

  return `${parentName}${toPascalCase(base, 'Item')}`
}

function uniqueTypeKey(type: TypeNode): string {
  if (type.kind === 'object') {
    return `object:${type.name}`
  }

  if (type.kind === 'array') {
    return `array:${uniqueTypeKey(type.element)}`
  }

  if (type.kind === 'union') {
    return `union:${type.types.map(uniqueTypeKey).sort().join('|')}`
  }

  return type.kind
}

function flattenUnion(type: TypeNode): TypeNode[] {
  return type.kind === 'union' ? type.types.flatMap(flattenUnion) : [type]
}

function mergeObjectFields(left: TypeNode, right: TypeNode): TypeNode | null {
  if (left.kind !== 'object' || right.kind !== 'object') {
    return null
  }

  const keys = new Set([
    ...left.fields.map((field) => field.key),
    ...right.fields.map((field) => field.key),
  ])

  return {
    kind: 'object',
    name: left.name,
    fields: [...keys].map((key) => {
      const leftField = left.fields.find((field) => field.key === key)
      const rightField = right.fields.find((field) => field.key === key)

      if (!leftField) {
        return { ...rightField!, optional: true }
      }

      if (!rightField) {
        return { ...leftField, optional: true }
      }

      return {
        key,
        optional: leftField.optional || rightField.optional,
        type: mergeTypes(leftField.type, rightField.type),
      }
    }),
  }
}

function mergeTypes(left: TypeNode, right: TypeNode): TypeNode {
  if (left.kind === 'unknown') {
    return right
  }

  if (right.kind === 'unknown') {
    return left
  }

  const mergedObject = mergeObjectFields(left, right)

  if (mergedObject) {
    return mergedObject
  }

  if (left.kind === 'array' && right.kind === 'array') {
    return {
      kind: 'array',
      element: mergeTypes(left.element, right.element),
    }
  }

  const flattened = [...flattenUnion(left), ...flattenUnion(right)]
  const byKey = new Map<string, TypeNode>()

  for (const item of flattened) {
    byKey.set(uniqueTypeKey(item), item)
  }

  const types = [...byKey.values()]

  return types.length === 1 ? types[0] : { kind: 'union', types }
}

function inferValue(value: unknown, typeName: string): TypeNode {
  if (value === null) {
    return { kind: 'null' }
  }

  if (Array.isArray(value)) {
    return {
      kind: 'array',
      element: value.length === 0
        ? { kind: 'unknown' }
        : value
          .map((item) => inferValue(item, typeName))
          .reduce(mergeTypes),
    }
  }

  if (isPlainObject(value)) {
    return inferObject([value], typeName)
  }

  if (typeof value === 'string') {
    return { kind: 'string' }
  }

  if (typeof value === 'number') {
    return { kind: 'number' }
  }

  if (typeof value === 'boolean') {
    return { kind: 'boolean' }
  }

  return { kind: 'unknown' }
}

function inferObject(objects: Array<Record<string, unknown>>, typeName: string): TypeNode {
  const keys = new Set(objects.flatMap((object) => Object.keys(object)))

  return {
    kind: 'object',
    name: typeName,
    fields: [...keys].map((key) => {
      const values = objects
        .filter((object) => Object.prototype.hasOwnProperty.call(object, key))
        .map((object) => object[key])

      return {
        key,
        optional: values.length < objects.length,
        type: values
          .map((value) => {
            if (Array.isArray(value)) {
              const arrayTypeName = childTypeName(typeName, key, true)

              return {
                kind: 'array' as const,
                element: value.length === 0
                  ? { kind: 'unknown' as const }
                  : value
                    .map((item) => inferValue(item, arrayTypeName))
                    .reduce(mergeTypes),
              }
            }

            return inferValue(value, childTypeName(typeName, key))
          })
          .reduce(mergeTypes),
      }
    }),
  }
}

function inferRoot(value: unknown, rootName: string): TypeNode | JsonTypeResult {
  if (Array.isArray(value)) {
    if (value.length === 0 || !value.every(isPlainObject)) {
      return {
        ok: false,
        message: '请提供 JSON 对象或对象数组。',
      }
    }

    return inferObject(value, rootName)
  }

  if (!isPlainObject(value)) {
    return {
      ok: false,
      message: '请提供 JSON 对象或对象数组。',
    }
  }

  return inferObject([value], rootName)
}

function collectObjects(type: TypeNode, collected = new Map<string, TypeNode>()) {
  if (type.kind === 'object') {
    if (!collected.has(type.name)) {
      collected.set(type.name, type)
    }

    for (const field of type.fields) {
      collectObjects(field.type, collected)
    }
  }

  if (type.kind === 'array') {
    collectObjects(type.element, collected)
  }

  if (type.kind === 'union') {
    for (const item of type.types) {
      collectObjects(item, collected)
    }
  }

  return [...collected.values()]
}

function hasNull(type: TypeNode): boolean {
  return flattenUnion(type).some((item) => item.kind === 'null')
}

function nonNullTypes(type: TypeNode): TypeNode[] {
  return flattenUnion(type).filter((item) => item.kind !== 'null')
}

function tsType(type: TypeNode): string {
  if (type.kind === 'object') {
    return type.name
  }

  if (type.kind === 'array') {
    const elementType = tsType(type.element)

    return type.element.kind === 'union' ? `(${elementType})[]` : `${elementType}[]`
  }

  if (type.kind === 'union') {
    return type.types.map(tsType).join(' | ')
  }

  return type.kind === 'unknown' ? 'unknown' : type.kind
}

function jsObjectKey(key: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key)
}

function generateTypeScript(root: TypeNode) {
  return collectObjects(root)
    .map((type) => {
      if (type.kind !== 'object') {
        return ''
      }

      const fields = type.fields
        .map((field) => `  ${jsObjectKey(field.key)}${field.optional ? '?' : ''}: ${tsType(field.type)}`)
        .join('\n')

      return `export interface ${type.name} {\n${fields}\n}`
    })
    .filter(Boolean)
    .join('\n\n')
}

function javaType(type: TypeNode): string {
  if (type.kind === 'object') {
    return type.name
  }

  if (type.kind === 'array') {
    return `List<${javaType(type.element)}>`
  }

  if (type.kind === 'union') {
    const withoutNull = nonNullTypes(type)

    return withoutNull.length === 1 ? javaType(withoutNull[0]) : 'Object'
  }

  const primitives: Record<PrimitiveKind, string> = {
    string: 'String',
    number: 'Double',
    boolean: 'Boolean',
    null: 'Object',
    unknown: 'Object',
  }

  return primitives[type.kind]
}

function renderJavaClass(type: TypeNode, nested = false): string {
  if (type.kind !== 'object') {
    return ''
  }

  const classPrefix = nested ? 'public static class' : 'public class'
  const fields = type.fields
    .map((field) => `  private ${javaType(field.type)} ${toCamelCase(field.key)};`)
    .join('\n')
  const nestedClasses = collectObjects(type)
    .filter((item) => item.kind === 'object' && item.name !== type.name)
    .map((item) => indent(renderJavaClass(item, true), 2))
    .join('\n\n')

  return [
    `${classPrefix} ${type.name} {`,
    fields,
    nestedClasses,
    '}',
  ].filter(Boolean).join('\n\n')
}

function generateJava(root: TypeNode) {
  const body = renderJavaClass(root)
  const needsList = body.includes('List<')

  return needsList ? `import java.util.List;\n\n${body}` : body
}

function goType(type: TypeNode): string {
  if (type.kind === 'object') {
    return type.name
  }

  if (type.kind === 'array') {
    return `[]${goType(type.element)}`
  }

  if (type.kind === 'union') {
    const withoutNull = nonNullTypes(type)

    return withoutNull.length === 1 ? goType(withoutNull[0]) : 'any'
  }

  const primitives: Record<PrimitiveKind, string> = {
    string: 'string',
    number: 'float64',
    boolean: 'bool',
    null: 'any',
    unknown: 'any',
  }

  return primitives[type.kind]
}

function generateGo(root: TypeNode) {
  return collectObjects(root)
    .map((type) => {
      if (type.kind !== 'object') {
        return ''
      }

      const fields = type.fields
        .map((field) => `  ${toGoFieldName(field.key)} ${goType(field.type)} \`json:"${field.key}"\``)
        .join('\n')

      return `type ${type.name} struct {\n${fields}\n}`
    })
    .filter(Boolean)
    .join('\n\n')
}

function zodSchemaName(typeName: string) {
  return `${typeName}Schema`
}

function zodType(type: TypeNode): string {
  if (type.kind === 'object') {
    return zodSchemaName(type.name)
  }

  if (type.kind === 'array') {
    return `z.array(${zodType(type.element)})`
  }

  if (type.kind === 'union') {
    const nullable = hasNull(type)
    const withoutNull = nonNullTypes(type)
    const base = withoutNull.length === 1
      ? zodType(withoutNull[0])
      : withoutNull.length > 1
        ? `z.union([${withoutNull.map(zodType).join(', ')}])`
        : 'z.null()'

    return nullable && base !== 'z.null()' ? `${base}.nullable()` : base
  }

  const primitives: Record<PrimitiveKind, string> = {
    string: 'z.string()',
    number: 'z.number()',
    boolean: 'z.boolean()',
    null: 'z.null()',
    unknown: 'z.unknown()',
  }

  return primitives[type.kind]
}

function generateZod(root: TypeNode) {
  const schemas = collectObjects(root).reverse().map((type) => {
    if (type.kind !== 'object') {
      return ''
    }

    const fields = type.fields
      .map((field) => {
        const optional = field.optional ? '.optional()' : ''

        return `  ${jsObjectKey(field.key)}: ${zodType(field.type)}${optional},`
      })
      .join('\n')

    return `export const ${zodSchemaName(type.name)} = z.object({\n${fields}\n})`
  })

  return `import { z } from 'zod'\n\n${schemas.filter(Boolean).join('\n\n')}`
}

function indent(input: string, spaces: number) {
  const prefix = ' '.repeat(spaces)

  return input.split('\n').map((line) => line ? `${prefix}${line}` : line).join('\n')
}

function generate(type: TypeNode, target: JsonTypeTarget) {
  if (target === 'typescript') {
    return generateTypeScript(type)
  }

  if (target === 'java') {
    return generateJava(type)
  }

  if (target === 'go') {
    return generateGo(type)
  }

  return generateZod(type)
}

export function convertJsonToType(
  input: string,
  target: JsonTypeTarget,
  rootName = 'Root',
): JsonTypeResult {
  let parsed: unknown

  try {
    parsed = JSON.parse(input)
  } catch (error) {
    const reason = error instanceof Error ? error.message : '未知解析错误'

    return {
      ok: false,
      message: `JSON 无效：${reason}`,
    }
  }

  const rootTypeName = toPascalCase(rootName, 'Root')
  const inferred = inferRoot(parsed, rootTypeName)

  if ('ok' in inferred) {
    return inferred
  }

  return {
    ok: true,
    value: generate(inferred, target),
    meta: `${targetLabels[target]} 已生成`,
  }
}
