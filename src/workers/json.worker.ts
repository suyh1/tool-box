import { formatJson, minifyJson, parseJson } from '@/tools/json/json'

export type JsonWorkerRequest = {
  mode: 'format' | 'minify' | 'validate'
  input: string
}

export type JsonWorkerResponse =
  | {
      ok: true
      output: string
      metadata: ReturnType<typeof parseJson>
    }
  | {
      ok: false
      message: string
    }

self.onmessage = (event: MessageEvent<JsonWorkerRequest>) => {
  const { mode, input } = event.data

  try {
    const metadata = parseJson(input)

    if (!metadata.ok) {
      self.postMessage(metadata satisfies JsonWorkerResponse)
      return
    }

    const output = mode === 'minify'
      ? minifyJson(input)
      : mode === 'format'
        ? formatJson(input)
        : input

    self.postMessage({
      ok: true,
      output,
      metadata,
    } satisfies JsonWorkerResponse)
  } catch (error) {
    self.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : 'JSON processing failed',
    } satisfies JsonWorkerResponse)
  }
}
