import YAML from 'yaml'

export type ConversionResult =
  | {
      ok: true
      value: string
      meta: string
    }
  | {
      ok: false
      message: string
    }

function requireInput(input: string): ConversionResult | null {
  return input.trim()
    ? null
    : {
        ok: false,
        message: '请输入要转换的内容。',
      }
}

export function jsonToYaml(input: string): ConversionResult {
  const empty = requireInput(input)

  if (empty) {
    return empty
  }

  try {
    const value = JSON.parse(input)

    return {
      ok: true,
      value: YAML.stringify(value).trimEnd(),
      meta: 'JSON 已转换为 YAML',
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : '未知解析错误'

    return {
      ok: false,
      message: `JSON 无效：${reason}`,
    }
  }
}

export function yamlToJson(input: string): ConversionResult {
  const empty = requireInput(input)

  if (empty) {
    return empty
  }

  try {
    const value = YAML.parse(input)

    return {
      ok: true,
      value: JSON.stringify(value, null, 2),
      meta: 'YAML 已转换为 JSON',
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : '未知解析错误'

    return {
      ok: false,
      message: `YAML 无效：${reason}`,
    }
  }
}
