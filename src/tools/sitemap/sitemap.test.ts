import { describe, expect, it } from 'vitest'
import { formatSitemap, validateSitemap } from './sitemap'

const validUrlset = [
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '<url><loc>https://example.com/</loc><lastmod>2026-07-06</lastmod><priority>0.8</priority></url>',
  '</urlset>',
].join('')

describe('sitemap utilities', () => {
  it('formats XML sitemap markup', () => {
    const result = formatSitemap(validUrlset)

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain('<urlset')
    expect(result.value).toContain('  <url>')
    expect(result.value).toContain('    <loc>')
    expect(result.value).toContain('https://example.com/')
    expect(result.meta).toBe('Sitemap 已格式化')
  })

  it('validates urlset sitemaps and counts URL entries', () => {
    expect(validateSitemap(validUrlset)).toEqual({
      ok: true,
      summary: {
        kind: 'urlset',
        urlCount: 1,
        sitemapCount: 0,
      },
      warnings: [],
    })
  })

  it('validates sitemap indexes and counts sitemap entries', () => {
    expect(validateSitemap([
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '<sitemap><loc>https://example.com/sitemap-posts.xml</loc></sitemap>',
      '</sitemapindex>',
    ].join(''))).toEqual({
      ok: true,
      summary: {
        kind: 'sitemapindex',
        urlCount: 0,
        sitemapCount: 1,
      },
      warnings: [],
    })
  })

  it('rejects documents that are not sitemaps', () => {
    expect(validateSitemap('<root><loc>https://example.com/</loc></root>')).toEqual({
      ok: false,
      message: 'Sitemap 根节点必须是 urlset 或 sitemapindex。',
    })
  })

  it('rejects entries with missing or invalid loc values', () => {
    expect(validateSitemap('<urlset><url><loc>ftp://example.com/</loc></url></urlset>')).toEqual({
      ok: false,
      message: '第 1 个 url 的 loc 必须是 http 或 https URL。',
    })
  })
})
