import prettier from 'prettier/standalone'
import htmlPlugin from 'prettier/plugins/html'

export type HtmlResult =
  | {
      ok: true
      value: string
      meta: string
    }
  | {
      ok: false
      message: string
    }

function requireHtml(input: string): HtmlResult | null {
  return input.trim()
    ? null
    : {
        ok: false,
        message: '请输入 HTML 内容。',
      }
}

export async function formatHtml(input: string): Promise<HtmlResult> {
  const empty = requireHtml(input)

  if (empty) {
    return empty
  }

  try {
    return {
      ok: true,
      value: await prettier.format(input, {
        parser: 'html',
        plugins: [htmlPlugin],
        printWidth: 100,
      }),
      meta: 'HTML 已格式化',
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `HTML 格式化失败：${error.message}` : 'HTML 格式化失败',
    }
  }
}

export function minifyHtml(input: string): HtmlResult {
  const empty = requireHtml(input)

  if (empty) {
    return empty
  }

  return {
    ok: true,
    value: input
      .replace(/<!--(?!\[if\b)[\s\S]*?-->/gi, '')
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .trim(),
    meta: 'HTML 已压缩',
  }
}
