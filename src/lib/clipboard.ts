export type ClipboardCopyResult =
  | { ok: true }
  | { ok: false; message: string }

export async function copyToClipboard(value: string): Promise<ClipboardCopyResult> {
  if (!navigator.clipboard?.writeText) {
    return {
      ok: false,
      message: '复制失败：当前浏览器不支持剪贴板写入。',
    }
  }

  try {
    await navigator.clipboard.writeText(value)
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error
        ? `复制失败：${error.message}`
        : '复制失败：浏览器拒绝访问剪贴板。',
    }
  }
}
