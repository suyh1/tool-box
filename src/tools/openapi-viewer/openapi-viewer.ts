import { parse } from 'yaml'

export interface OpenApiOperationSummary {
  method: string
  path: string
  summary: string
}

export type OpenApiValidationResult =
  | {
      ok: true
      title: string
      version: string
      openapi: string
      pathCount: number
      operationCount: number
      operations: OpenApiOperationSummary[]
      warnings: string[]
    }
  | {
      ok: false
      message: string
    }

const HTTP_METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function validateOpenApiSpec(input: string): OpenApiValidationResult {
  let document: unknown

  try {
    document = parse(input)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `OpenAPI 文档解析失败：${error.message}` : 'OpenAPI 文档解析失败',
    }
  }

  if (!isRecord(document)) {
    return { ok: false, message: 'OpenAPI 文档必须是对象。' }
  }

  const missing = ['openapi', 'info', 'paths'].filter((key) => !(key in document))
  if (missing.length > 0) {
    return { ok: false, message: `OpenAPI 文档缺少 ${missing.join(' 和 ')}。` }
  }

  if (!isRecord(document.info) || !isRecord(document.paths)) {
    return { ok: false, message: 'OpenAPI 文档的 info 和 paths 必须是对象。' }
  }

  const operations: OpenApiOperationSummary[] = []

  for (const [path, pathItem] of Object.entries(document.paths)) {
    if (!isRecord(pathItem)) {
      continue
    }

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method.toLowerCase())) {
        continue
      }

      operations.push({
        method: method.toUpperCase(),
        path,
        summary: isRecord(operation) && typeof operation.summary === 'string' ? operation.summary : '',
      })
    }
  }

  return {
    ok: true,
    title: typeof document.info.title === 'string' ? document.info.title : '',
    version: typeof document.info.version === 'string' ? document.info.version : '',
    openapi: typeof document.openapi === 'string' ? document.openapi : '',
    pathCount: Object.keys(document.paths).length,
    operationCount: operations.length,
    operations,
    warnings: operations.length === 0 ? ['paths 中没有发现 HTTP operation。'] : [],
  }
}
