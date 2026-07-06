export type ConnectionStringResult =
  | {
      ok: true
      scheme: string
      username: string
      password: string
      host: string
      port: string
      database: string
      params: Record<string, string>
      redacted: string
    }
  | {
      ok: false
      message: string
    }

export function parseConnectionString(input: string): ConnectionStringResult {
  let url: URL

  try {
    url = new URL(input)
  } catch {
    return { ok: false, message: '请输入有效连接字符串 URL。' }
  }

  const redacted = new URL(url.toString())
  if (redacted.password) {
    redacted.password = '***'
  }

  return {
    ok: true,
    scheme: url.protocol.replace(/:$/u, ''),
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: url.port,
    database: decodeURIComponent(url.pathname.replace(/^\//u, '')),
    params: Object.fromEntries(url.searchParams.entries()),
    redacted: redacted.toString(),
  }
}
