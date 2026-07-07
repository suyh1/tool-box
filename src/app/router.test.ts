import { describe, expect, it } from 'vitest'
import router from './router'

describe('router', () => {
  it('redirects legacy merged tool paths to their workbenches', () => {
    expect(router.getRoutes().find((route) => route.path === '/tools/url-parser')?.redirect).toBe('/tools/url')
    expect(router.getRoutes().find((route) => route.path === '/tools/qr-decode')?.redirect).toBe('/tools/qr-code')
    expect(router.getRoutes().find((route) => route.path === '/tools/kubernetes-yaml')?.redirect).toBe('/tools/docker-compose')
  })
})
