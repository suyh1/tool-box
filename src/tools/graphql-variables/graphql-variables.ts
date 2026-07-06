export interface GraphqlVariablesResult {
  ok: true
  defined: string[]
  provided: string[]
  missingRequired: string[]
  unusedProvided: string[]
  invalidJson: string
}

interface VariableDefinition {
  name: string
  required: boolean
}

function extractVariableDefinitions(query: string): VariableDefinition[] {
  const signature = query.match(/\b(?:query|mutation|subscription)\b[^{]*\(([^)]*)\)/u)?.[1] ?? ''
  const definitions: VariableDefinition[] = []

  for (const match of signature.matchAll(/\$([A-Za-z_]\w*)\s*:\s*([^,)]+)/gu)) {
    definitions.push({
      name: match[1],
      required: match[2].trim().endsWith('!'),
    })
  }

  return definitions
}

export function checkGraphqlVariables(query: string, variablesJson: string): GraphqlVariablesResult {
  const definitions = extractVariableDefinitions(query)
  let variables: Record<string, unknown> = {}
  let invalidJson = ''

  try {
    const parsed = variablesJson.trim() ? JSON.parse(variablesJson) as unknown : {}
    variables = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}
  } catch (error) {
    invalidJson = error instanceof Error ? error.message : 'Invalid JSON'
  }

  const defined = definitions.map((definition) => definition.name)
  const provided = Object.keys(variables)
  const missingRequired = definitions
    .filter((definition) => definition.required && !(definition.name in variables))
    .map((definition) => definition.name)
  const unusedProvided = provided.filter((key) => !defined.includes(key))

  return {
    ok: true,
    defined,
    provided,
    missingRequired,
    unusedProvided,
    invalidJson,
  }
}
