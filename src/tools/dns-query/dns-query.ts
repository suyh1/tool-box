export type DnsProvider = 'cloudflare' | 'google'
export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'TXT'

export interface DnsQueryOptions {
  provider: DnsProvider
  name: string
  type: DnsRecordType
}

export type DnsQueryUrlResult =
  | {
      ok: true
      url: string
    }
  | {
      ok: false
      message: string
    }

export interface NormalizedDnsAnswer {
  name: string
  type: number
  ttl: number
  data: string
}

export interface NormalizedDnsResponse {
  status: number
  answers: NormalizedDnsAnswer[]
}

const PROVIDER_ENDPOINTS: Record<DnsProvider, string> = {
  cloudflare: 'https://cloudflare-dns.com/dns-query',
  google: 'https://dns.google/resolve',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function buildDohUrl(options: DnsQueryOptions): DnsQueryUrlResult {
  const name = options.name.trim()

  if (!name) {
    return { ok: false, message: '请输入域名。' }
  }

  const url = new URL(PROVIDER_ENDPOINTS[options.provider])
  url.searchParams.set('name', name)
  url.searchParams.set('type', options.type)

  return { ok: true, url: url.toString() }
}

export function normalizeDohResponse(response: unknown): NormalizedDnsResponse {
  const body = isRecord(response) ? response : {}
  const answers = Array.isArray(body.Answer) ? body.Answer : []

  return {
    status: typeof body.Status === 'number' ? body.Status : -1,
    answers: answers.filter(isRecord).map((answer) => ({
      name: typeof answer.name === 'string' ? answer.name : '',
      type: typeof answer.type === 'number' ? answer.type : 0,
      ttl: typeof answer.TTL === 'number' ? answer.TTL : 0,
      data: typeof answer.data === 'string' ? answer.data : '',
    })),
  }
}
