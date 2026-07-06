import { describe, expect, it } from 'vitest'
import { formatKubernetesReport, inspectKubernetesYaml } from './kubernetes-yaml'

describe('kubernetes-yaml', () => {
  it('summarizes Kubernetes resources across multi-document YAML', () => {
    const result = inspectKubernetesYaml(`
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: prod
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
`)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.resourceCount).toBe(2)
    expect(result.resources).toEqual([
      { document: 1, apiVersion: 'v1', kind: 'Service', name: 'api', namespace: 'prod' },
      { document: 2, apiVersion: 'apps/v1', kind: 'Deployment', name: 'api', namespace: '' },
    ])
    expect(result.warnings).toEqual([])
  })

  it('reports missing apiVersion and metadata.name as warnings', () => {
    const result = inspectKubernetesYaml('kind: ConfigMap\nmetadata: {}')

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.warnings).toEqual([
      'document 1 is missing apiVersion.',
      'document 1 is missing metadata.name.',
    ])
  })

  it('rejects YAML with no Kubernetes resources', () => {
    expect(inspectKubernetesYaml('# empty')).toEqual({
      ok: false,
      message: '没有发现 Kubernetes YAML 资源。',
    })
  })

  it('formats a compact resource report', () => {
    const result = inspectKubernetesYaml('apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: settings')

    expect(formatKubernetesReport(result)).toContain('ConfigMap/settings')
  })
})
