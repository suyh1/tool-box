import { describe, expect, it } from 'vitest'
import { jsonToYaml, yamlToJson } from './yaml-json'

describe('yaml/json conversion', () => {
  it('converts JSON to YAML', () => {
    const result = jsonToYaml('{"name":"Toolbox","enabled":true,"ports":[3000,4174]}')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain('name: Toolbox')
    expect(result.value).toContain('enabled: true')
    expect(result.value).toContain('- 3000')
  })

  it('converts YAML to formatted JSON', () => {
    const result = yamlToJson('name: Toolbox\nenabled: true\nports:\n  - 3000\n')

    expect(result).toEqual({
      ok: true,
      value: '{\n  "name": "Toolbox",\n  "enabled": true,\n  "ports": [\n    3000\n  ]\n}',
      meta: 'YAML 已转换为 JSON',
    })
  })

  it('returns an error for invalid JSON', () => {
    expect(jsonToYaml('{')).toMatchObject({
      ok: false,
      message: expect.stringContaining('JSON 无效'),
    })
  })

  it('returns an error for invalid YAML', () => {
    expect(yamlToJson('name: [unterminated')).toMatchObject({
      ok: false,
      message: expect.stringContaining('YAML 无效'),
    })
  })
})
