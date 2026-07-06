import prettier from 'prettier/standalone'
import postcssPlugin from 'prettier/plugins/postcss'

export type CssResult =
  | {
      ok: true
      value: string
      meta: string
    }
  | {
      ok: false
      message: string
    }

function requireCss(input: string): CssResult | null {
  return input.trim()
    ? null
    : {
        ok: false,
        message: '请输入 CSS 内容。',
      }
}

export async function formatCss(input: string): Promise<CssResult> {
  const empty = requireCss(input)

  if (empty) {
    return empty
  }

  try {
    return {
      ok: true,
      value: await prettier.format(input, {
        parser: 'css',
        plugins: [postcssPlugin],
        printWidth: 100,
      }),
      meta: 'CSS 已格式化',
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `CSS 格式化失败：${error.message}` : 'CSS 格式化失败',
    }
  }
}

export function minifyCss(input: string): CssResult {
  const empty = requireCss(input)

  if (empty) {
    return empty
  }

  return {
    ok: true,
    value: input
      .replace(/\/\*(?!\!)[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/(\/\*![\s\S]*?\*\/)\s+/g, '$1')
      .replace(/\s*([{}:;,>+~])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim(),
    meta: 'CSS 已压缩',
  }
}
