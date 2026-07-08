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

const allowedTags = new Set([
  'a',
  'blockquote',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
  'span',
])
const blockedTags = new Set([
  'audio',
  'button',
  'canvas',
  'embed',
  'form',
  'iframe',
  'img',
  'input',
  'link',
  'math',
  'meta',
  'object',
  'option',
  'picture',
  'script',
  'select',
  'source',
  'style',
  'svg',
  'textarea',
  'video',
])
const allowedGlobalAttributes = new Set(['class'])
const allowedAttributesByTag = new Map<string, Set<string>>([
  ['a', new Set(['href', 'target', 'rel', 'title'])],
  ['code', new Set(['class'])],
  ['span', new Set(['class'])],
  ['th', new Set(['align'])],
  ['td', new Set(['align'])],
])
const allowedProtocols = new Set(['http:', 'https:', 'mailto:'])

markdown.renderer.rules.image = (tokens, index) => {
  const alt = tokens[index].content.trim()
  const label = alt ? `图片：${alt}` : '图片已禁用'

  return `<span class="markdown-image-placeholder">${markdown.utils.escapeHtml(label)}</span>`
}

const defaultLinkOpen = markdown.renderer.rules.link_open

markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  const token = tokens[index]
  const href = token.attrGet('href')

  if (href && isSafeUrl(href)) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }

  return defaultLinkOpen
    ? defaultLinkOpen(tokens, index, options, env, self)
    : self.renderToken(tokens, index, options)
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

function isSafeUrl(value: string) {
  try {
    const url = new URL(value, 'https://toolbox.local')
    return allowedProtocols.has(url.protocol)
  } catch {
    return false
  }
}

export function sanitizeMarkdownHtml(html: string) {
  if (!html.trim()) {
    return ''
  }

  const template = document.createElement('template')
  template.innerHTML = html

  const sanitizeNode = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove()
        continue
      }

      if (child.nodeType !== Node.ELEMENT_NODE) {
        continue
      }

      const element = child as Element
      const tag = element.tagName.toLowerCase()

      if (blockedTags.has(tag)) {
        element.remove()
        continue
      }

      if (!allowedTags.has(tag)) {
        sanitizeNode(element)
        element.replaceWith(...Array.from(element.childNodes))
        continue
      }

      const tagAttributes = allowedAttributesByTag.get(tag) ?? new Set<string>()

      for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase()
        const value = attribute.value
        const allowed = allowedGlobalAttributes.has(name) || tagAttributes.has(name)

        if (!allowed || name.startsWith('on')) {
          element.removeAttribute(attribute.name)
          continue
        }

        if (name === 'href' && !isSafeUrl(value)) {
          element.removeAttribute(attribute.name)
          continue
        }

        element.setAttribute(attribute.name, value)
      }

      if (tag === 'a' && element.hasAttribute('href')) {
        element.setAttribute('target', '_blank')
        element.setAttribute('rel', 'noopener noreferrer')
      }

      sanitizeNode(element)
    }
  }

  sanitizeNode(template.content)

  return template.innerHTML
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
    html: sanitizeMarkdownHtml(markdown.render(input)),
    headings,
    stats: {
      headingCount: headings.length,
      lineCount: lineCount(input),
      wordCount,
      readingMinutes: wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 220)) : 0,
    },
  }
}
