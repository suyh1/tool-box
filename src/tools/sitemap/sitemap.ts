import { formatXml } from '@/tools/xml/xml'

export type SitemapKind = 'urlset' | 'sitemapindex'

export interface SitemapSummary {
  kind: SitemapKind
  urlCount: number
  sitemapCount: number
}

export type SitemapValidationResult =
  | {
      ok: true
      summary: SitemapSummary
      warnings: string[]
    }
  | {
      ok: false
      message: string
    }

export type SitemapFormatResult =
  | {
      ok: true
      value: string
      meta: string
    }
  | {
      ok: false
      message: string
    }

function parseXmlDocument(input: string) {
  const document = new DOMParser().parseFromString(input, 'application/xml')
  const parserError = document.querySelector('parsererror')

  if (parserError) {
    throw new Error(`XML 无效：${parserError.textContent?.trim() || '解析失败'}`)
  }

  return document
}

function childElements(element: Element, localName: string) {
  return [...element.children].filter((child) => child.localName === localName)
}

function childText(element: Element, localName: string) {
  return childElements(element, localName)[0]?.textContent?.trim() ?? ''
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)

    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validateLastmod(value: string, warnings: string[], label: string) {
  if (value && Number.isNaN(Date.parse(value))) {
    warnings.push(`${label} 的 lastmod 不是可解析日期。`)
  }
}

export function validateSitemap(input: string): SitemapValidationResult {
  if (!input.trim()) {
    return {
      ok: false,
      message: '请输入 XML Sitemap 内容。',
    }
  }

  try {
    const document = parseXmlDocument(input)
    const root = document.documentElement
    const warnings: string[] = []

    if (root.localName !== 'urlset' && root.localName !== 'sitemapindex') {
      return {
        ok: false,
        message: 'Sitemap 根节点必须是 urlset 或 sitemapindex。',
      }
    }

    if (root.localName === 'urlset') {
      const urls = childElements(root, 'url')

      for (const [index, url] of urls.entries()) {
        const label = `第 ${index + 1} 个 url`
        const loc = childText(url, 'loc')
        const priority = childText(url, 'priority')

        if (!isHttpUrl(loc)) {
          return {
            ok: false,
            message: `${label} 的 loc 必须是 http 或 https URL。`,
          }
        }

        validateLastmod(childText(url, 'lastmod'), warnings, label)

        if (priority) {
          const numericPriority = Number(priority)

          if (!Number.isFinite(numericPriority) || numericPriority < 0 || numericPriority > 1) {
            warnings.push(`${label} 的 priority 应在 0 到 1 之间。`)
          }
        }
      }

      return {
        ok: true,
        summary: {
          kind: 'urlset',
          urlCount: urls.length,
          sitemapCount: 0,
        },
        warnings,
      }
    }

    const sitemaps = childElements(root, 'sitemap')

    for (const [index, sitemap] of sitemaps.entries()) {
      const label = `第 ${index + 1} 个 sitemap`
      const loc = childText(sitemap, 'loc')

      if (!isHttpUrl(loc)) {
        return {
          ok: false,
          message: `${label} 的 loc 必须是 http 或 https URL。`,
        }
      }

      validateLastmod(childText(sitemap, 'lastmod'), warnings, label)
    }

    return {
      ok: true,
      summary: {
        kind: 'sitemapindex',
        urlCount: 0,
        sitemapCount: sitemaps.length,
      },
      warnings,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Sitemap 解析失败',
    }
  }
}

export function formatSitemap(input: string): SitemapFormatResult {
  const validation = validateSitemap(input)

  if (!validation.ok) {
    return validation
  }

  try {
    return {
      ok: true,
      value: formatXml(input),
      meta: 'Sitemap 已格式化',
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Sitemap 格式化失败',
    }
  }
}
