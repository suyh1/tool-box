import { parse, stringify } from 'yaml'

export type ConversionResult =
  | {
      ok: true
      output: string
      warnings: string[]
    }
  | {
      ok: false
      message: string
    }

type ComposeService = Record<string, unknown>
type ComposeOutputService = Record<string, unknown>
type ConversionError = Extract<ConversionResult, { ok: false }>

interface DockerRunParseSuccess {
  ok: true
  serviceName: string
  service: ComposeOutputService
  warnings: string[]
}

interface TokenizeResult {
  ok: true
  tokens: string[]
}

interface TokenizeError {
  ok: false
  message: string
}

const composeOnlyServiceKeys = [
  'build',
  'depends_on',
  'secrets',
  'configs',
  'profiles',
  'deploy',
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stringifyScalar(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function shellQuote(value: string): string {
  if (value === '') {
    return '""'
  }

  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(value)) {
    return value
  }

  return `"${value.replace(/(["\\$`])/g, '\\$1')}"`
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (isRecord(item)) {
        const published = stringifyScalar(item.published)
        const target = stringifyScalar(item.target)
        const protocol = stringifyScalar(item.protocol)
        const range = published && target ? `${published}:${target}` : target || published

        return protocol && protocol !== 'tcp' ? `${range}/${protocol}` : range
      }

      return stringifyScalar(item)
    }).filter(Boolean)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)]
  }

  return []
}

function normalizeKeyValueFlags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => stringifyScalar(item)).filter(Boolean)
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, rawValue]) => `${key}=${stringifyScalar(rawValue)}`)
      .filter(Boolean)
  }

  return []
}

function normalizeMapOrList(value: unknown): string[] {
  return normalizeKeyValueFlags(value)
}

function normalizeCommand(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => shellQuote(stringifyScalar(item))).filter(Boolean)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)]
  }

  return []
}

function normalizeHealthcheckTest(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (!Array.isArray(value)) {
    return ''
  }

  const [mode, ...rest] = value.map(stringifyScalar)
  if (mode === 'NONE') {
    return 'none'
  }

  return rest.join(' ')
}

function setStringArray(service: ComposeOutputService, key: string, value: string) {
  const current = service[key]
  if (Array.isArray(current)) {
    current.push(value)
    return
  }

  service[key] = [value]
}

function setKeyValue(service: ComposeOutputService, key: string, value: string) {
  const separatorIndex = value.indexOf('=')
  const itemKey = separatorIndex === -1 ? value : value.slice(0, separatorIndex)
  const itemValue = separatorIndex === -1 ? '' : value.slice(separatorIndex + 1)
  const current = service[key]

  if (isRecord(current)) {
    current[itemKey] = itemValue
    return
  }

  service[key] = {
    [itemKey]: itemValue,
  }
}

function toServiceName(image: string, usedNames: Set<string>) {
  const baseName = image
    .split('/')
    .pop()
    ?.replace(/[:@].*$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'service'

  let serviceName = baseName
  let suffix = 2
  while (usedNames.has(serviceName)) {
    serviceName = `${baseName}-${suffix}`
    suffix += 1
  }
  usedNames.add(serviceName)

  return serviceName
}

function tokenizeShellCommand(command: string): TokenizeResult | TokenizeError {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  let escaping = false

  for (const char of command) {
    if (escaping) {
      current += char
      escaping = false
      continue
    }

    if (char === '\\' && quote !== "'") {
      escaping = true
      continue
    }

    if ((char === '"' || char === "'") && !quote) {
      quote = char
      continue
    }

    if (char === quote) {
      quote = null
      continue
    }

    if (!quote && /\s/.test(char)) {
      if (current) {
        tokens.push(current)
        current = ''
      }
      continue
    }

    current += char
  }

  if (escaping) {
    current += '\\'
  }

  if (quote) {
    return {
      ok: false,
      message: 'docker run 命令解析失败：引号未闭合。',
    }
  }

  if (current) {
    tokens.push(current)
  }

  return {
    ok: true,
    tokens,
  }
}

function getDockerRunStartIndex(tokens: string[]) {
  if (tokens[0] === 'docker' && tokens[1] === 'run') {
    return 2
  }

  if (tokens[0] === 'docker' && tokens[1] === 'container' && tokens[2] === 'run') {
    return 3
  }

  return -1
}

function assignHealthcheck(service: ComposeOutputService, key: string, value: string | number | string[]) {
  const current = service.healthcheck
  const healthcheck = isRecord(current) ? current : {}
  healthcheck[key] = value
  service.healthcheck = healthcheck
}

function normalizeRunCommands(input: string): string[] {
  return input
    .replace(/\\\r?\n/g, ' ')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function unsupportedValueWarning(flag: string) {
  if (flag === '--cidfile') {
    return '--cidfile is not represented in Compose output.'
  }

  if (flag === '--log-driver') {
    return '--log-driver is daemon/runtime logging configuration and may not round-trip.'
  }

  if (flag === '--memory') {
    return '--memory is resource configuration; Compose support depends on runtime mode.'
  }

  if (flag === '--cpus') {
    return '--cpus is resource configuration; Compose support depends on runtime mode.'
  }

  return `Unrecognized docker run flag ${flag} was not converted.`
}

function applyRunFlag(service: ComposeOutputService, flag: string, value: string | undefined, warnings: string[]) {
  if (flag === '--name' && value) {
    service.container_name = value
  } else if ((flag === '--publish' || flag === '-p') && value) {
    setStringArray(service, 'ports', value)
  } else if ((flag === '--env' || flag === '-e') && value) {
    setKeyValue(service, 'environment', value)
  } else if (flag === '--env-file' && value) {
    setStringArray(service, 'env_file', value)
  } else if ((flag === '--volume' || flag === '-v' || flag === '--mount') && value) {
    setStringArray(service, 'volumes', value)
  } else if ((flag === '--workdir' || flag === '-w') && value) {
    service.working_dir = value
  } else if ((flag === '--user' || flag === '-u') && value) {
    service.user = value
  } else if (flag === '--network' && value) {
    if (value === 'host' || value === 'none') {
      service.network_mode = value
    } else {
      setStringArray(service, 'networks', value)
    }
  } else if (flag === '--hostname' && value) {
    service.hostname = value
  } else if (flag === '--dns' && value) {
    setStringArray(service, 'dns', value)
  } else if (flag === '--add-host' && value) {
    setStringArray(service, 'extra_hosts', value)
  } else if (flag === '--label' && value) {
    setKeyValue(service, 'labels', value)
  } else if (flag === '--restart' && value) {
    service.restart = value
  } else if (flag === '--entrypoint' && value) {
    service.entrypoint = value
  } else if (flag === '--privileged') {
    service.privileged = true
  } else if (flag === '--cap-add' && value) {
    setStringArray(service, 'cap_add', value)
  } else if (flag === '--cap-drop' && value) {
    setStringArray(service, 'cap_drop', value)
  } else if (flag === '--device' && value) {
    setStringArray(service, 'devices', value)
  } else if (flag === '--platform' && value) {
    service.platform = value
  } else if (flag === '--pull' && value) {
    service.pull_policy = value
  } else if (flag === '--init') {
    service.init = true
  } else if (flag === '--tty' || flag === '-t') {
    service.tty = true
  } else if (flag === '--interactive' || flag === '-i') {
    service.stdin_open = true
  } else if (flag === '--health-cmd' && value) {
    assignHealthcheck(service, 'test', ['CMD-SHELL', value])
  } else if (flag === '--health-interval' && value) {
    assignHealthcheck(service, 'interval', value)
  } else if (flag === '--health-timeout' && value) {
    assignHealthcheck(service, 'timeout', value)
  } else if (flag === '--health-retries' && value) {
    assignHealthcheck(service, 'retries', Number(value))
  } else if (flag === '--health-start-period' && value) {
    assignHealthcheck(service, 'start_period', value)
  } else if (flag === '--no-healthcheck') {
    assignHealthcheck(service, 'test', ['NONE'])
  } else if (flag === '--rm') {
    warnings.push('--rm is runtime-only and is not represented in Compose output.')
  } else if (flag === '-d' || flag === '--detach') {
    return
  } else if (flag === '--cidfile' || flag === '--log-driver' || flag === '--memory' || flag === '--cpus') {
    warnings.push(unsupportedValueWarning(flag))
  } else {
    warnings.push(unsupportedValueWarning(flag))
  }
}

function parseDockerRunCommand(command: string, usedNames: Set<string>): ConversionError | DockerRunParseSuccess {
  const tokenized = tokenizeShellCommand(command)
  if (!tokenized.ok) {
    return tokenized
  }

  const startIndex = getDockerRunStartIndex(tokenized.tokens)
  if (startIndex === -1) {
    return {
      ok: false,
      message: '请输入 docker run 命令。',
    }
  }

  const service: ComposeOutputService = {}
  const warnings: string[] = []
  let image = ''
  let commandTokens: string[] = []

  for (let index = startIndex; index < tokenized.tokens.length; index += 1) {
    const token = tokenized.tokens[index]

    if (token === '--') {
      image = tokenized.tokens[index + 1] ?? ''
      commandTokens = tokenized.tokens.slice(index + 2)
      break
    }

    if (!token.startsWith('-')) {
      image = token
      commandTokens = tokenized.tokens.slice(index + 1)
      break
    }

    if (token.startsWith('--')) {
      const equalIndex = token.indexOf('=')
      const flag = equalIndex === -1 ? token : token.slice(0, equalIndex)
      let value = equalIndex === -1 ? undefined : token.slice(equalIndex + 1)
      const booleanFlags = new Set([
        '--detach',
        '--rm',
        '--init',
        '--tty',
        '--interactive',
        '--privileged',
        '--no-healthcheck',
      ])
      const valueFlags = new Set([
        '--name',
        '--publish',
        '--env',
        '--env-file',
        '--volume',
        '--mount',
        '--workdir',
        '--user',
        '--network',
        '--hostname',
        '--dns',
        '--add-host',
        '--label',
        '--restart',
        '--entrypoint',
        '--cap-add',
        '--cap-drop',
        '--device',
        '--platform',
        '--pull',
        '--health-cmd',
        '--health-interval',
        '--health-timeout',
        '--health-retries',
        '--health-start-period',
        '--cidfile',
        '--log-driver',
        '--memory',
        '--cpus',
      ])

      if (!booleanFlags.has(flag) && equalIndex === -1) {
        if (valueFlags.has(flag)) {
          value = tokenized.tokens[index + 1]
          index += 1
        } else if (tokenized.tokens[index + 1] && !tokenized.tokens[index + 1].startsWith('-') && tokenized.tokens[index + 2]) {
          value = tokenized.tokens[index + 1]
          index += 1
        }
      }

      applyRunFlag(service, flag, value, warnings)
      continue
    }

    if (token === '-p' || token === '-e' || token === '-v' || token === '-w' || token === '-u') {
      applyRunFlag(service, token, tokenized.tokens[index + 1], warnings)
      index += 1
      continue
    }

    if (token.startsWith('-p') || token.startsWith('-e') || token.startsWith('-v')) {
      applyRunFlag(service, token.slice(0, 2), token.slice(2), warnings)
      continue
    }

    const shortFlags = token.slice(1).split('')
    if (shortFlags.every((flag) => ['d', 'i', 't'].includes(flag))) {
      for (const flag of shortFlags) {
        applyRunFlag(service, `-${flag}`, undefined, warnings)
      }
      continue
    }

    warnings.push(`Unrecognized docker run flag ${token} was not converted.`)
  }

  if (!image) {
    return {
      ok: false,
      message: 'docker run 命令缺少镜像名称。',
    }
  }

  service.image = image
  if (commandTokens.length > 0) {
    service.command = commandTokens
  }

  const serviceName = typeof service.container_name === 'string'
    ? toServiceName(service.container_name, usedNames)
    : toServiceName(image, usedNames)

  return {
    ok: true,
    serviceName,
    service,
    warnings,
  }
}

function addRepeatedFlags(parts: string[], flag: string, values: string[]) {
  for (const value of values) {
    parts.push(flag, shellQuote(value))
  }
}

function addBooleanFlag(parts: string[], flag: string, value: unknown) {
  if (value === true) {
    parts.push(flag)
  }
}

function addComposeOnlyWarnings(serviceName: string, service: ComposeService, warnings: string[]) {
  for (const key of composeOnlyServiceKeys) {
    if (!(key in service)) {
      continue
    }

    if (key === 'build') {
      warnings.push(`service "${serviceName}" uses build; docker run cannot build images before starting containers.`)
    } else if (key === 'depends_on') {
      warnings.push(`service "${serviceName}" uses depends_on; start order is not represented in docker run.`)
    } else if (key === 'secrets') {
      warnings.push(`service "${serviceName}" uses secrets; docker run has no direct Compose secrets equivalent.`)
    } else if (key === 'configs') {
      warnings.push(`service "${serviceName}" uses configs; docker run has no direct Compose configs equivalent.`)
    } else if (key === 'profiles') {
      warnings.push(`service "${serviceName}" uses profiles; docker run has no profile selection equivalent.`)
    } else if (key === 'deploy') {
      warnings.push(`service "${serviceName}" uses deploy; docker run ignores Compose deployment settings.`)
    }
  }
}

function composeServiceToDockerRun(serviceName: string, service: ComposeService, warnings: string[]): string {
  const image = typeof service.image === 'string' ? service.image : ''
  const parts = ['docker', 'run', '-d']
  const containerName = typeof service.container_name === 'string' ? service.container_name : serviceName

  parts.push('--name', shellQuote(containerName))

  if (service.restart) {
    parts.push('--restart', shellQuote(stringifyScalar(service.restart)))
  }

  addRepeatedFlags(parts, '-p', normalizeStringList(service.ports))
  addRepeatedFlags(parts, '--env', normalizeKeyValueFlags(service.environment))
  addRepeatedFlags(parts, '--env-file', normalizeStringList(service.env_file))
  addRepeatedFlags(parts, '-v', normalizeStringList(service.volumes))

  if (service.working_dir) {
    parts.push('-w', shellQuote(stringifyScalar(service.working_dir)))
  }

  if (service.user) {
    parts.push('-u', shellQuote(stringifyScalar(service.user)))
  }

  if (service.entrypoint) {
    const entrypoint = Array.isArray(service.entrypoint)
      ? stringifyScalar(service.entrypoint[0])
      : stringifyScalar(service.entrypoint)
    if (entrypoint) {
      parts.push('--entrypoint', shellQuote(entrypoint))
    }
  }

  addRepeatedFlags(parts, '--label', normalizeMapOrList(service.labels))
  addRepeatedFlags(parts, '--dns', normalizeStringList(service.dns))
  addRepeatedFlags(parts, '--add-host', normalizeStringList(service.extra_hosts))
  addRepeatedFlags(parts, '--cap-add', normalizeStringList(service.cap_add))
  addRepeatedFlags(parts, '--cap-drop', normalizeStringList(service.cap_drop))
  addRepeatedFlags(parts, '--device', normalizeStringList(service.devices))

  if (service.platform) {
    parts.push('--platform', shellQuote(stringifyScalar(service.platform)))
  }

  if (service.pull_policy) {
    parts.push('--pull', shellQuote(stringifyScalar(service.pull_policy)))
  }

  addBooleanFlag(parts, '--init', service.init)
  addBooleanFlag(parts, '-t', service.tty)
  addBooleanFlag(parts, '-i', service.stdin_open)

  if (isRecord(service.healthcheck)) {
    const healthCmd = normalizeHealthcheckTest(service.healthcheck.test)
    if (healthCmd === 'none') {
      parts.push('--no-healthcheck')
    } else if (healthCmd) {
      parts.push('--health-cmd', shellQuote(healthCmd))
    }

    if (service.healthcheck.interval) {
      parts.push('--health-interval', shellQuote(stringifyScalar(service.healthcheck.interval)))
    }
    if (service.healthcheck.timeout) {
      parts.push('--health-timeout', shellQuote(stringifyScalar(service.healthcheck.timeout)))
    }
    if (service.healthcheck.retries) {
      parts.push('--health-retries', shellQuote(stringifyScalar(service.healthcheck.retries)))
    }
    if (service.healthcheck.start_period) {
      parts.push('--health-start-period', shellQuote(stringifyScalar(service.healthcheck.start_period)))
    }
  }

  if (!image) {
    warnings.push(`service "${serviceName}" has no image; docker run output uses the service name as a placeholder image.`)
  }

  parts.push(shellQuote(image || serviceName))
  parts.push(...normalizeCommand(service.command))

  return parts.join(' ')
}

export function convertComposeToDockerRun(input: string): ConversionResult {
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
  if ('volumes' in document) {
    warnings.push('top-level volumes are not created by docker run output.')
  }
  if ('networks' in document) {
    warnings.push('top-level networks are not created by docker run output.')
  }

  const commands = Object.entries(document.services).flatMap(([serviceName, service]) => {
    if (!isRecord(service)) {
      warnings.push(`service "${serviceName}" should be an object.`)
      return []
    }

    addComposeOnlyWarnings(serviceName, service, warnings)
    return [composeServiceToDockerRun(serviceName, service, warnings)]
  })

  return {
    ok: true,
    output: commands.join('\n\n'),
    warnings,
  }
}

export function convertDockerRunToCompose(input: string): ConversionResult {
  const commands = normalizeRunCommands(input)
  if (commands.length === 0) {
    return {
      ok: false,
      message: '请输入 docker run 命令。',
    }
  }

  const usedNames = new Set<string>()
  const services: Record<string, ComposeOutputService> = {}
  const warnings: string[] = []

  for (const command of commands) {
    const result = parseDockerRunCommand(command, usedNames)
    if (!result.ok) {
      return result
    }

    services[result.serviceName] = result.service
    warnings.push(...result.warnings)
  }

  return {
    ok: true,
    output: stringify({
      services,
    }, {
      lineWidth: 0,
    }).trimEnd(),
    warnings,
  }
}
