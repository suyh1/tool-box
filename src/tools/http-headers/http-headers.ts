export interface HttpHeader {
  name: string
  value: string
}

export interface HttpHeadersResult {
  startLine: string
  headers: HttpHeader[]
  object: Record<string, string[]>
}

export function parseHttpHeaders(input: string): HttpHeadersResult {
  const lines = input
    .replace(/\\n/g, '\n')
    .split(/\r\n|\r|\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
  const startLine = lines[0]?.includes(':') ? '' : lines[0] ?? ''
  const headerLines = startLine ? lines.slice(1) : lines
  const headers: HttpHeader[] = []
  const object: Record<string, string[]> = {}

  for (const line of headerLines) {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) {
      continue
    }

    const name = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    const key = name.toLowerCase()
    headers.push({ name, value })
    object[key] ??= []
    object[key].push(value)
  }

  return { startLine, headers, object }
}
