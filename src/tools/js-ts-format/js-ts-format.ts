import type { Plugin } from 'prettier'

export type ScriptLanguage = 'javascript' | 'typescript'

export interface ScriptFormatOptions {
  language: ScriptLanguage
}

export type ScriptFormatResult =
  | {
      ok: true
      value: string
      meta: string
    }
  | {
      ok: false
      message: string
    }

function languageLabel(language: ScriptLanguage) {
  return language === 'typescript' ? 'TypeScript' : 'JavaScript'
}

async function loadFormatter(language: ScriptLanguage) {
  const parserPlugin = language === 'typescript'
    ? import('prettier/plugins/typescript')
    : import('prettier/plugins/babel')
  const [
    { default: prettier },
    { default: estreePlugin },
    { default: syntaxPlugin },
  ] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/estree'),
    parserPlugin,
  ])

  return {
    prettier,
    plugins: [syntaxPlugin, estreePlugin] satisfies Plugin[],
  }
}

export async function formatJavaScriptTypeScript(
  input: string,
  options: ScriptFormatOptions,
): Promise<ScriptFormatResult> {
  if (!input.trim()) {
    return {
      ok: false,
      message: '请输入 JavaScript / TypeScript 内容。',
    }
  }

  const parser = options.language === 'typescript' ? 'typescript' : 'babel'

  try {
    const { prettier, plugins } = await loadFormatter(options.language)

    return {
      ok: true,
      value: await prettier.format(input, {
        parser,
        plugins,
        printWidth: 100,
        semi: true,
        singleQuote: false,
      }),
      meta: `${languageLabel(options.language)} 已格式化`,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error
        ? `${languageLabel(options.language)} 格式化失败：${error.message}`
        : `${languageLabel(options.language)} 格式化失败`,
    }
  }
}
