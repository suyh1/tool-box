import { parse } from 'yaml'

export interface DockerComposeServiceSummary {
  name: string
  image: string
  build: string
  ports: string[]
  environment: Record<string, string>
  dependsOn: string[]
}

export type DockerComposeInspectionResult =
  | {
      ok: true
      serviceCount: number
      services: DockerComposeServiceSummary[]
      warnings: string[]
    }
  | {
      ok: false
      message: string
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stringifyScalar(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (isRecord(item)) {
        const published = stringifyScalar(item.published)
        const target = stringifyScalar(item.target)
        const protocol = stringifyScalar(item.protocol)
        const range = published && target ? `${published}:${target}` : target || published

        return protocol ? `${range}/${protocol}` : range
      }

      return stringifyScalar(item)
    }).filter(Boolean)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)]
  }

  return []
}

function normalizeEnvironment(value: unknown): Record<string, string> {
  if (Array.isArray(value)) {
    return Object.fromEntries(value.map((item) => {
      const text = stringifyScalar(item)
      const separatorIndex = text.indexOf('=')

      return separatorIndex === -1
        ? [text, '']
        : [text.slice(0, separatorIndex), text.slice(separatorIndex + 1)]
    }).filter(([key]) => key))
  }

  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, rawValue]) => [key, stringifyScalar(rawValue)]))
  }

  return {}
}

function normalizeDependsOn(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(stringifyScalar).filter(Boolean)
  }

  if (isRecord(value)) {
    return Object.keys(value)
  }

  return []
}

function normalizeBuild(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (isRecord(value)) {
    return stringifyScalar(value.context || value.dockerfile)
  }

  return ''
}

export function inspectDockerCompose(input: string): DockerComposeInspectionResult {
  let document: unknown

  try {
    document = parse(input)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `Docker Compose YAML 解析失败：${error.message}` : 'Docker Compose YAML 解析失败。',
    }
  }

  if (!isRecord(document) || !isRecord(document.services)) {
    return {
      ok: false,
      message: 'Docker Compose 文件必须包含 services 对象。',
    }
  }

  const warnings: string[] = []
  const services = Object.entries(document.services).flatMap(([name, service]) => {
    if (!isRecord(service)) {
      warnings.push(`service "${name}" should be an object.`)
      return []
    }

    const image = typeof service.image === 'string' ? service.image : ''
    const build = normalizeBuild(service.build)

    if (!image && !build) {
      warnings.push(`service "${name}" should define image or build.`)
    }

    return [{
      name,
      image,
      build,
      ports: normalizeStringList(service.ports),
      environment: normalizeEnvironment(service.environment),
      dependsOn: normalizeDependsOn(service.depends_on),
    }]
  })

  return {
    ok: true,
    serviceCount: services.length,
    services,
    warnings,
  }
}

export function formatDockerComposeReport(result: DockerComposeInspectionResult): string {
  if (!result.ok) {
    return result.message
  }

  const lines = [`Docker Compose: ${result.serviceCount} services`]

  for (const service of result.services) {
    const parts = [
      service.image ? `image=${service.image}` : '',
      service.build ? `build=${service.build}` : '',
      service.ports.length ? `ports=${service.ports.join(', ')}` : '',
      Object.keys(service.environment).length ? `env=${Object.keys(service.environment).length}` : '',
      service.dependsOn.length ? `depends_on=${service.dependsOn.join(', ')}` : '',
    ].filter(Boolean)

    lines.push(`- ${service.name}${parts.length ? ` (${parts.join('; ')})` : ''}`)
  }

  if (result.warnings.length > 0) {
    lines.push('', 'Warnings:', ...result.warnings.map((warning) => `- ${warning}`))
  }

  return lines.join('\n')
}
