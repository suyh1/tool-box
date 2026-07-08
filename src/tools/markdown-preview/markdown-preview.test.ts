import { describe, expect, it } from 'vitest'
import { renderMarkdownPreview, sanitizeMarkdownHtml } from './markdown-preview'

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

  it('does not render data url links', () => {
    const result = renderMarkdownPreview('[Open](data:text/html,<script>alert(1)</script>)')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.html).not.toContain('href="data:')
    expect(result.html).not.toContain('<script>')
  })

  it('keeps http links inert for tabnabbing', () => {
    const result = renderMarkdownPreview('[Docs](https://example.com/docs)')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.html).toContain('href="https://example.com/docs"')
    expect(result.html).toContain('target="_blank"')
    expect(result.html).toContain('rel="noopener noreferrer"')
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

  it('sanitizes future raw HTML renderer output before preview injection', () => {
    const html = sanitizeMarkdownHtml('<p onclick="alert(1)">Hi</p><img src="https://example.com/a.png"><a href="javascript:alert(1)">x</a><script>alert(1)</script>')

    expect(html).toContain('<p>Hi</p>')
    expect(html).not.toContain('onclick')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('href="javascript:')
  })

  it('rejects empty markdown input', () => {
    expect(renderMarkdownPreview('   ')).toEqual({
      ok: false,
      message: '请输入 Markdown 内容。',
    })
  })
})
