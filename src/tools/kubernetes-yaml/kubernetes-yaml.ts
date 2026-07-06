import { parseAllDocuments } from 'yaml'

export interface KubernetesResourceSummary {
  document: number
  apiVersion: string
  kind: string
  name: string
  namespace: string
}

export type KubernetesInspectionResult =
  | {
      ok: true
      resourceCount: number
      resources: KubernetesResourceSummary[]
      warnings: string[]
    }
  | {
      ok: false
      message: string
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function readString(record: Record<string, unknown>, key: string): string {
  return typeof record[key] === 'string' ? record[key] : ''
}

export function inspectKubernetesYaml(input: string): KubernetesInspectionResult {
  let documents: ReturnType<typeof parseAllDocuments>

  try {
    documents = parseAllDocuments(input)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `Kubernetes YAML 解析失败：${error.message}` : 'Kubernetes YAML 解析失败。',
    }
  }

  const firstDocumentError = documents.flatMap((document) => document.errors)[0]
  if (firstDocumentError) {
    return {
      ok: false,
      message: `Kubernetes YAML 解析失败：${firstDocumentError.message}`,
    }
  }

  const warnings: string[] = []
  const resources: KubernetesResourceSummary[] = []

  documents.forEach((document, index) => {
    const resource = document.toJSON() as unknown
    if (resource === null || resource === undefined) {
      return
    }

    if (!isRecord(resource)) {
      warnings.push(`document ${index + 1} is not an object resource.`)
      return
    }

    const metadata = isRecord(resource.metadata) ? resource.metadata : {}
    const summary = {
      document: index + 1,
      apiVersion: readString(resource, 'apiVersion'),
      kind: readString(resource, 'kind'),
      name: readString(metadata, 'name'),
      namespace: readString(metadata, 'namespace'),
    }

    if (!summary.apiVersion) {
      warnings.push(`document ${summary.document} is missing apiVersion.`)
    }

    if (!summary.kind) {
      warnings.push(`document ${summary.document} is missing kind.`)
    }

    if (!summary.name) {
      warnings.push(`document ${summary.document} is missing metadata.name.`)
    }

    resources.push(summary)
  })

  if (resources.length === 0) {
    return {
      ok: false,
      message: '没有发现 Kubernetes YAML 资源。',
    }
  }

  return {
    ok: true,
    resourceCount: resources.length,
    resources,
    warnings,
  }
}

export function formatKubernetesReport(result: KubernetesInspectionResult): string {
  if (!result.ok) {
    return result.message
  }

  const lines = [`Kubernetes YAML: ${result.resourceCount} resources`]

  for (const resource of result.resources) {
    const label = `${resource.kind || '(missing kind)'}/${resource.name || '(missing name)'}`
    const namespace = resource.namespace ? ` namespace=${resource.namespace}` : ''
    const apiVersion = resource.apiVersion ? ` apiVersion=${resource.apiVersion}` : ''

    lines.push(`- document ${resource.document}: ${label}${namespace}${apiVersion}`)
  }

  if (result.warnings.length > 0) {
    lines.push('', 'Warnings:', ...result.warnings.map((warning) => `- ${warning}`))
  }

  return lines.join('\n')
}
