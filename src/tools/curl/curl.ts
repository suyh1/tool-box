export type CurlTarget = 'fetch' | 'axios' | 'python'

export interface CurlRequest {
  method: string
  url: string
  headers: Record<string, string>
  body: string | null
  auth: {
    username: string
    password: string
  } | null
}

export type CurlParseResult =
  | {
      ok: true
      value: CurlRequest
    }
  | {
      ok: false
      message: string
    }

export type CurlCodeResult =
  | {
      ok: true
      value: string
      meta: string
    }
  | {
      ok: false
      message: string
    }

export function tokenizeCurl(command: string) {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  let escaping = false

  for (const char of command.trim()) {
    if (escaping) {
      current += char
      escaping = false
      continue
    }

    if (char === '\\') {
      escaping = true
      continue
    }

    if (quote) {
      if (char === quote) {
        quote = null
      } else {
        current += char
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current)
        current = ''
      }
      continue
    }

    current += char
  }

  if (current) {
    tokens.push(current)
  }

  return tokens
}

function isUrl(token: string) {
  return /^https?:\/\//i.test(token)
}

function splitHeader(value: string) {
  const colonIndex = value.indexOf(':')

  if (colonIndex === -1) {
    return null
  }

  return {
    key: value.slice(0, colonIndex).trim(),
    value: value.slice(colonIndex + 1).trim(),
  }
}

function splitAuth(value: string) {
  const colonIndex = value.indexOf(':')

  return colonIndex === -1
    ? { username: value, password: '' }
    : {
        username: value.slice(0, colonIndex),
        password: value.slice(colonIndex + 1),
      }
}

export function parseCurlCommand(command: string): CurlParseResult {
  const tokens = tokenizeCurl(command)

  if (tokens[0] === 'curl') {
    tokens.shift()
  }

  const request: CurlRequest = {
    method: 'GET',
    url: '',
    headers: {},
    body: null,
    auth: null,
  }

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    const next = tokens[index + 1]

    if (token === '-X' || token === '--request') {
      request.method = (next ?? 'GET').toUpperCase()
      index += 1
      continue
    }

    if (token === '-H' || token === '--header') {
      const header = splitHeader(next ?? '')

      if (header?.key) {
        request.headers[header.key] = header.value
      }

      index += 1
      continue
    }

    if (['-d', '--data', '--data-raw', '--data-binary'].includes(token)) {
      request.body = next ?? ''
      request.method = request.method === 'GET' ? 'POST' : request.method
      index += 1
      continue
    }

    if (token === '-u' || token === '--user') {
      request.auth = splitAuth(next ?? '')
      index += 1
      continue
    }

    if (isUrl(token)) {
      request.url = token
    }
  }

  if (!request.url) {
    return {
      ok: false,
      message: '没有找到请求 URL。',
    }
  }

  return {
    ok: true,
    value: request,
  }
}

function js(value: string) {
  return JSON.stringify(value).replace(/"/g, "'")
}

function py(value: string) {
  return JSON.stringify(value).replace(/"/g, "'")
}

function objectEntries(object: Record<string, string>, indent = 4) {
  const spaces = ' '.repeat(indent)

  return Object.entries(object)
    .map(([key, value]) => `${spaces}${js(key)}: ${js(value)},`)
    .join('\n')
}

function pythonDict(object: Record<string, string>, indent = 4) {
  const spaces = ' '.repeat(indent)

  return Object.entries(object)
    .map(([key, value]) => `${spaces}${py(key)}: ${py(value)},`)
    .join('\n')
}

function generateFetch(request: CurlRequest) {
  const options: string[] = [`  method: ${js(request.method)},`]

  if (Object.keys(request.headers).length > 0) {
    options.push(`  headers: {\n${objectEntries(request.headers, 4)}\n  },`)
  }

  if (request.auth) {
    const token = `btoa(${js(`${request.auth.username}:${request.auth.password}`)})`
    const separator = Object.keys(request.headers).length > 0 ? '' : '  headers: {\n'
    const closer = Object.keys(request.headers).length > 0 ? '' : '\n  },'

    if (Object.keys(request.headers).length > 0) {
      const headerIndex = options.findIndex((line) => line.startsWith('  headers'))
      options[headerIndex] = options[headerIndex].replace('\n  },', `\n    'Authorization': \`Basic \${${token}}\`,\n  },`)
    } else {
      options.push(`${separator}    'Authorization': \`Basic \${${token}}\`,${closer}`)
    }
  }

  if (request.body !== null) {
    options.push(`  body: ${js(request.body)},`)
  }

  return `const response = await fetch(${js(request.url)}, {\n${options.join('\n')}\n})\n\nconst data = await response.json()`
}

function generateAxios(request: CurlRequest) {
  const method = request.method.toLowerCase()
  const hasBody = request.body !== null && !['get', 'delete', 'head'].includes(method)
  const config: string[] = []

  if (Object.keys(request.headers).length > 0) {
    config.push(`  headers: {\n${objectEntries(request.headers, 4)}\n  },`)
  }

  if (request.auth) {
    config.push(`  auth: { username: ${js(request.auth.username)}, password: ${js(request.auth.password)} },`)
  }

  const configText = config.length > 0 ? `{\n${config.join('\n')}\n}` : '{}'

  if (hasBody) {
    return `const response = await axios.${method}(${js(request.url)}, ${js(request.body ?? '')}, ${configText})`
  }

  return `const response = await axios.${method}(${js(request.url)}${config.length > 0 ? `, ${configText}` : ''})`
}

function generatePython(request: CurlRequest) {
  const method = request.method.toLowerCase()
  const args: string[] = [py(request.url)]

  if (Object.keys(request.headers).length > 0) {
    args.push(`headers={\n${pythonDict(request.headers, 4)}\n}`)
  }

  if (request.auth) {
    args.push(`auth=(${py(request.auth.username)}, ${py(request.auth.password)})`)
  }

  if (request.body !== null) {
    args.push(`data=${py(request.body)}`)
  }

  return `import requests\n\nresponse = requests.${method}(${args.join(', ')})\nprint(response.text)`
}

export function convertCurlToCode(command: string, target: CurlTarget): CurlCodeResult {
  const parsed = parseCurlCommand(command)

  if (!parsed.ok) {
    return parsed
  }

  const generators: Record<CurlTarget, (request: CurlRequest) => string> = {
    fetch: generateFetch,
    axios: generateAxios,
    python: generatePython,
  }

  const labels: Record<CurlTarget, string> = {
    fetch: 'Fetch 代码已生成',
    axios: 'Axios 代码已生成',
    python: 'Python requests 代码已生成',
  }

  return {
    ok: true,
    value: generators[target](parsed.value),
    meta: labels[target],
  }
}
