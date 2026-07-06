import { renderMarkdownPreview } from '@/tools/markdown-preview/markdown-preview'

export interface MarkdownTocOptions {
  minLevel?: number
  maxLevel?: number
  ordered?: boolean
}

export type MarkdownTocResult =
  | {
      ok: true
      value: string
      meta: string
    }
  | {
      ok: false
      message: string
    }

function normalizeLevel(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  return Math.min(6, Math.max(1, Math.trunc(value as number)))
}

export function generateMarkdownToc(input: string, options: MarkdownTocOptions = {}): MarkdownTocResult {
  const preview = renderMarkdownPreview(input)

  if (!preview.ok) {
    return preview
  }

  const minLevel = normalizeLevel(options.minLevel, 2)
  const maxLevel = Math.max(minLevel, normalizeLevel(options.maxLevel, 6))
  const headings = preview.headings.filter((heading) => heading.level >= minLevel && heading.level <= maxLevel)

  if (headings.length === 0) {
    return {
      ok: false,
      message: '未找到可生成目录的标题。',
    }
  }

  const marker = options.ordered ? '1.' : '-'
  const value = headings
    .map((heading) => {
      const indent = '  '.repeat(Math.max(0, heading.level - minLevel))

      return `${indent}${marker} [${heading.text}](#${heading.slug})`
    })
    .join('\n')

  return {
    ok: true,
    value,
    meta: `已生成 ${headings.length} 个目录项`,
  }
}
