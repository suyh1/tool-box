import { describe, expect, it } from 'vitest'
import { summarizeHar } from './har-viewer'

describe('summarizeHar', () => {
  it('summarizes HAR entries by method, URL, status, mime type, size, and duration', () => {
    const result = summarizeHar(JSON.stringify({
      log: {
        entries: [
          {
            request: { method: 'GET', url: 'https://example.com/api/users' },
            response: {
              status: 200,
              content: { mimeType: 'application/json', size: 128 },
            },
            time: 42.4,
          },
        ],
      },
    }))

    expect(result).toEqual({
      ok: true,
      entryCount: 1,
      totalSize: 128,
      totalTime: 42.4,
      entries: [
        {
          method: 'GET',
          url: 'https://example.com/api/users',
          status: 200,
          mimeType: 'application/json',
          size: 128,
          time: 42.4,
        },
      ],
    })
  })
})
