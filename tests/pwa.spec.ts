import { expect, test } from '@playwright/test'

test.describe('PWA production preview', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'production-preview', 'PWA checks run against production preview only')
  })

  test('serves an installable manifest with icons', async ({ page }) => {
    const response = await page.request.get('/manifest.webmanifest')

    expect(response.ok()).toBe(true)

    const manifest = await response.json() as {
      lang?: string
      icons?: Array<{
        src: string
        sizes?: string
        type?: string
        purpose?: string
      }>
    }

    expect(manifest.lang).toBe('zh-CN')
    expect(manifest.icons?.some((icon) => icon.sizes === '192x192')).toBe(true)
    expect(manifest.icons?.some((icon) => icon.sizes === '512x512')).toBe(true)
    expect(manifest.icons?.some((icon) => icon.purpose?.includes('maskable'))).toBe(true)

    for (const icon of manifest.icons ?? []) {
      const iconResponse = await page.request.get(`/${icon.src}`)
      expect(iconResponse.ok(), icon.src).toBe(true)
    }
  })

  test('registers a service worker in production preview', async ({ page }) => {
    await page.goto('/')

    const registrationCount = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return 0
      }

      await navigator.serviceWorker.ready
      return (await navigator.serviceWorker.getRegistrations()).length
    })

    expect(registrationCount).toBeGreaterThan(0)
  })
})
