export interface HarEntrySummary {
  method: string
  url: string
  status: number
  mimeType: string
  size: number
  time: number
}

export type HarSummaryResult =
  | {
      ok: true
      entryCount: number
      totalSize: number
      totalTime: number
      entries: HarEntrySummary[]
    }
  | {
      ok: false
      message: string
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export function summarizeHar(input: string): HarSummaryResult {
  let parsed: unknown

  try {
    parsed = JSON.parse(input)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `HAR JSON 无效：${error.message}` : 'HAR JSON 无效',
    }
  }

  if (!isRecord(parsed) || !isRecord(parsed.log) || !Array.isArray(parsed.log.entries)) {
    return { ok: false, message: 'HAR 文件缺少 log.entries。' }
  }

  const entries = parsed.log.entries.map((entry): HarEntrySummary => {
    const item = isRecord(entry) ? entry : {}
    const request = isRecord(item.request) ? item.request : {}
    const response = isRecord(item.response) ? item.response : {}
    const content = isRecord(response.content) ? response.content : {}

    return {
      method: stringValue(request.method),
      url: stringValue(request.url),
      status: numberValue(response.status),
      mimeType: stringValue(content.mimeType),
      size: numberValue(content.size),
      time: numberValue(item.time),
    }
  })

  return {
    ok: true,
    entryCount: entries.length,
    totalSize: entries.reduce((sum, entry) => sum + entry.size, 0),
    totalTime: entries.reduce((sum, entry) => sum + entry.time, 0),
    entries,
  }
}
