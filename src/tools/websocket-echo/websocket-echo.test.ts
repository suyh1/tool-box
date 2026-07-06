import { describe, expect, it } from 'vitest'
import { createWebSocketConfig, formatTranscript } from './websocket-echo'

describe('websocket echo helpers', () => {
  it('validates ws URLs and parses protocol lists', () => {
    expect(createWebSocketConfig('wss://echo.example.com/socket', 'json, chat')).toEqual({
      ok: true,
      url: 'wss://echo.example.com/socket',
      protocols: ['json', 'chat'],
    })
  })

  it('rejects non-websocket URLs', () => {
    expect(createWebSocketConfig('https://example.com', '')).toEqual({
      ok: false,
      message: 'WebSocket URL 必须使用 ws:// 或 wss://。',
    })
  })

  it('formats transcript entries', () => {
    expect(formatTranscript([
      { direction: 'sent', message: 'ping' },
      { direction: 'received', message: 'pong' },
    ])).toBe('[sent] ping\n[received] pong')
  })
})
