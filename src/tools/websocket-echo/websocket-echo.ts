export interface WebSocketConfig {
  ok: true
  url: string
  protocols: string[]
}

export type WebSocketConfigResult =
  | WebSocketConfig
  | {
      ok: false
      message: string
    }

export interface WebSocketTranscriptEntry {
  direction: 'sent' | 'received' | 'status' | 'error'
  message: string
}

export function createWebSocketConfig(urlInput: string, protocolsInput: string): WebSocketConfigResult {
  let url: URL

  try {
    url = new URL(urlInput)
  } catch {
    return { ok: false, message: '请输入有效 WebSocket URL。' }
  }

  if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
    return { ok: false, message: 'WebSocket URL 必须使用 ws:// 或 wss://。' }
  }

  return {
    ok: true,
    url: url.toString(),
    protocols: protocolsInput.split(',').map((protocol) => protocol.trim()).filter(Boolean),
  }
}

export function formatTranscript(entries: WebSocketTranscriptEntry[]) {
  return entries.map((entry) => `[${entry.direction}] ${entry.message}`).join('\n')
}
