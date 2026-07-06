export interface QueryParam {
  key: string
  value: string
}

export function parseQueryString(input: string): QueryParam[] {
  const normalized = input.startsWith('?') ? input.slice(1) : input
  const params = new URLSearchParams(normalized)

  return [...params.entries()].map(([key, value]) => ({ key, value }))
}

export function buildQueryString(params: QueryParam[]) {
  const searchParams = new URLSearchParams()

  for (const param of params) {
    if (param.key) {
      searchParams.append(param.key, param.value)
    }
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function setQueryParam(urlInput: string, key: string, value: string) {
  const url = new URL(urlInput)
  url.searchParams.set(key, value)
  return url.toString()
}
