import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyToClipboard } from './clipboard'

describe('copyToClipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reports a successful clipboard write', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await expect(copyToClipboard('hello')).resolves.toEqual({ ok: true })
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('returns a user-facing failure message when the browser rejects clipboard access', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('permission denied')),
      },
    })

    await expect(copyToClipboard('hello')).resolves.toEqual({
      ok: false,
      message: '复制失败：permission denied',
    })
  })

  it('returns a clear failure message when clipboard access is unavailable', async () => {
    vi.stubGlobal('navigator', {})

    await expect(copyToClipboard('hello')).resolves.toEqual({
      ok: false,
      message: '复制失败：当前浏览器不支持剪贴板写入。',
    })
  })
})
