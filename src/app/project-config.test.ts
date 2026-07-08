import { describe, expect, it } from 'vitest'
import packageJson from '../../package.json'
import playwrightConfig from '../../playwright.config'

describe('project verification configuration', () => {
  it('exposes a single verification script and local-first host defaults', () => {
    expect(packageJson.scripts).toMatchObject({
      verify: 'npm run typecheck && npm test && npm run build && npm run test:e2e',
      dev: 'vite --host 127.0.0.1',
      'dev:lan': 'vite --host 0.0.0.0',
      preview: 'vite preview --host 127.0.0.1',
      'preview:lan': 'vite preview --host 0.0.0.0',
    })
  })

  it('uses strict local Playwright server settings', () => {
    const webServer = Array.isArray(playwrightConfig.webServer)
      ? playwrightConfig.webServer[0]
      : playwrightConfig.webServer

    expect(webServer?.command).toContain('--host 127.0.0.1')
    expect(webServer?.command).toContain('--strictPort')
    expect(webServer?.reuseExistingServer).toBe(!process.env.CI)
    expect(playwrightConfig.retries).toBe(process.env.CI ? 2 : 0)
  })
})
