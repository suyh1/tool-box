import MarkdownIt from 'markdown-it'

export interface MarkdownHeading {
  level: number
  text: string
  slug: string
}

export interface MarkdownPreviewStats {
  headingCount: number
  lineCount: number
  wordCount: number
  readingMinutes: number
}

export type MarkdownPreviewResult =
  | {
      ok: true
      html: string
      headings: MarkdownHeading[]
      stats: MarkdownPreviewStats
    }
  | {
      ok: false
      message: string
    }

const markdown = new MarkdownIt({
  breaks: false,
  html: false,
  linkify: true,
  typographer: true,
})

markdown.renderer.rules.image = (tokens, index) => {
  const alt = tokens[index].content.trim()
  const label = alt ? `图片：${alt}` : '图片已禁用'

  return `<span class="markdown-image-placeholder">${markdown.utils.escapeHtml(label)}</span>`
}

function slugify(text: string, fallback: string) {
  const slug = text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')

  return slug || fallback
}

function extractHeadings(input: string) {
  const tokens = markdown.parse(input, {})
  const slugCounts = new Map<string, number>()
  const headings: MarkdownHeading[] = []

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]

    if (token.type !== 'heading_open') {
      continue
    }

    const level = Number(token.tag.replace('h', ''))
    const text = tokens[index + 1]?.content ?? ''
    const baseSlug = slugify(text, `heading-${headings.length + 1}`)
    const count = (slugCounts.get(baseSlug) ?? 0) + 1
    const slug = count === 1 ? baseSlug : `${baseSlug}-${count}`

    slugCounts.set(baseSlug, count)
    headings.push({ level, text, slug })
  }

  return headings
}

function countWords(input: string) {
  const withoutCode = input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
  const words = withoutCode.match(/[\p{Letter}\p{Number}]+/gu)

  return words?.length ?? 0
}

function lineCount(input: string) {
  return input.length === 0 ? 0 : input.split(/\r\n|\r|\n/).length
}

export function renderMarkdownPreview(input: string): MarkdownPreviewResult {
  if (!input.trim()) {
    return {
      ok: false,
      message: '请输入 Markdown 内容。',
    }
  }

  const headings = extractHeadings(input)
  const wordCount = countWords(input)

  return {
    ok: true,
    html: markdown.render(input),
    headings,
    stats: {
      headingCount: headings.length,
      lineCount: lineCount(input),
      wordCount,
      readingMinutes: wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 220)) : 0,
    },
  }
}
