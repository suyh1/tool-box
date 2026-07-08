import { describe, expect, it } from 'vitest'
import { renderMarkdownPreview } from './markdown-preview'

describe('markdown preview utilities', () => {
  it('renders common markdown blocks and inline emphasis', () => {
    const result = renderMarkdownPreview('# Release Notes\n\nHello **world**.\n\n- Added CSV tools\n- Fixed docs')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.html).toContain('<h1>Release Notes</h1>')
    expect(result.html).toContain('<strong>world</strong>')
    expect(result.html).toContain('<li>Added CSV tools</li>')
    expect(result.headings).toEqual([
      {
        level: 1,
        text: 'Release Notes',
        slug: 'release-notes',
      },
    ])
    expect(result.stats).toMatchObject({
      headingCount: 1,
      lineCount: 6,
    })
  })

  it('renders fenced code blocks without executing raw HTML', () => {
    const result = renderMarkdownPreview('```ts\nconst tag = "<script>"\n```\n\n<script>alert(1)</script>')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.html).toContain('class="language-ts"')
    expect(result.html).toContain('&lt;script&gt;')
    expect(result.html).not.toContain('<script>')
  })

  it('does not render javascript links', () => {
    const result = renderMarkdownPreview('[Open](javascript:alert(1))')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.html).not.toContain('href="javascript:')
  })

  it('does not render remote markdown images', () => {
    const result = renderMarkdownPreview('![secret diagram](https://example.com/secret.png)')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.html).not.toContain('<img')
    expect(result.html).not.toContain('https://example.com/secret.png')
    expect(result.html).toContain('secret diagram')
  })

  it('rejects empty markdown input', () => {
    expect(renderMarkdownPreview('   ')).toEqual({
      ok: false,
      message: '请输入 Markdown 内容。',
    })
  })
})
