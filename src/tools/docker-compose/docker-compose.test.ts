import { describe, expect, it } from 'vitest'
import { formatDockerComposeReport, inspectDockerCompose } from './docker-compose'

describe('docker-compose', () => {
  it('summarizes services, ports, environment, and dependencies', () => {
    const result = inspectDockerCompose(`
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    environment:
      NODE_ENV: production
      DEBUG: "false"
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      - POSTGRES_DB=app
      - POSTGRES_PASSWORD=secret
`)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.serviceCount).toBe(2)
    expect(result.services[0]).toMatchObject({
      name: 'web',
      image: 'nginx:alpine',
      ports: ['8080:80'],
      environment: {
        NODE_ENV: 'production',
        DEBUG: 'false',
      },
      dependsOn: ['db'],
    })
    expect(result.services[1].environment.POSTGRES_DB).toBe('app')
    expect(result.warnings).toEqual([])
  })

  it('warns when a service has neither image nor build context', () => {
    const result = inspectDockerCompose('services:\n  worker:\n    command: npm start')

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.warnings).toContain('service "worker" should define image or build.')
  })

  it('rejects documents without a services map', () => {
    const result = inspectDockerCompose('version: "3.9"')

    expect(result).toEqual({
      ok: false,
      message: 'Docker Compose 文件必须包含 services 对象。',
    })
  })

  it('formats a readable inspection report', () => {
    const result = inspectDockerCompose('services:\n  web:\n    image: nginx\n    ports:\n      - "8080:80"')

    expect(formatDockerComposeReport(result)).toContain('web')
    expect(formatDockerComposeReport(result)).toContain('8080:80')
  })
})
