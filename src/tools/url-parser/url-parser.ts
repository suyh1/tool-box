export type UrlParserResult =
  | {
      ok: true
      protocol: string
      username: string
      password: string
      host: string
      hostname: string
      port: string
      pathname: string
      search: string
      hash: string
      origin: string
      query: Record<string, string[]>
    }
  | {
      ok: false
      message: string
    }

function queryObject(searchParams: URLSearchParams) {
  const query: Record<string, string[]> = {}

  for (const [key, value] of searchParams) {
    query[key] ??= []
    query[key].push(value)
  }

  return query
}

export function parseUrlDetails(input: string): UrlParserResult {
  let url: URL

  try {
    url = new URL(input)
  } catch {
    return { ok: false, message: '请输入有效 URL。' }
  }

  return {
    ok: true,
    protocol: url.protocol,
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    origin: url.origin,
    query: queryObject(url.searchParams),
  }
}
