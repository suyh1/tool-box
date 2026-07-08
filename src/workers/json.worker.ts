import { formatJson, minifyJson, parseJson } from '@/tools/json/json'

export type JsonWorkerRequest = {
  requestId: number
  mode: 'format' | 'minify' | 'validate'
  input: string
}

export type JsonWorkerResponse =
  | {
      requestId: number
      ok: true
      output: string
      metadata: ReturnType<typeof parseJson>
    }
  | {
      requestId: number
      ok: false
      message: string
    }

self.onmessage = (event: MessageEvent<JsonWorkerRequest>) => {
  const { requestId, mode, input } = event.data

  try {
    const metadata = parseJson(input)

    if (!metadata.ok) {
      self.postMessage({ requestId, ...metadata } satisfies JsonWorkerResponse)
      return
    }

    const output = mode === 'minify'
      ? minifyJson(input)
      : mode === 'format'
        ? formatJson(input)
        : input

    self.postMessage({
      requestId,
      ok: true,
      output,
      metadata,
    } satisfies JsonWorkerResponse)
  } catch (error) {
    self.postMessage({
      requestId,
      ok: false,
      message: error instanceof Error ? error.message : 'JSON 处理失败',
    } satisfies JsonWorkerResponse)
  }
}
