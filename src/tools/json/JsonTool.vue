<script setup lang="ts">
import { Check, Clipboard, FileJson2, RotateCcw, Sparkles, Trash2 } from '@lucide/vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { JsonParseResult } from './json'
import { formatJson, minifyJson, parseJson } from './json'
import type { JsonWorkerRequest, JsonWorkerResponse } from '@/workers/json.worker'

type JsonMode = JsonWorkerRequest['mode']

const sampleJson = JSON.stringify({
  name: 'Toolbox',
  enabled: true,
  runtime: 'browser',
  tools: ['json', 'base64', 'timestamp'],
}, null, 2)

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const metadata = ref<JsonParseResult | null>(null)
const isProcessing = ref(false)
const copied = ref(false)
let worker: Worker | null = null

const metadataLabel = computed(() => {
  if (!metadata.value?.ok) {
    return '等待有效 JSON'
  }

  const parsed = metadata.value

  if (parsed.kind === 'object') {
    const count = parsed.size ?? 0
    return `对象，${count} 个键`
  }

  if (parsed.kind === 'array') {
    const count = parsed.size ?? 0
    return `数组，${count} 个项目`
  }

  const kindLabels: Record<string, string> = {
    string: '字符串',
    number: '数字',
    boolean: '布尔值',
    null: 'null',
  }

  return `有效 ${kindLabels[parsed.kind] ?? parsed.kind}`
})

const canCopy = computed(() => output.value.length > 0)

function getWorker() {
  if (worker) {
    return worker
  }

  worker = new Worker(new URL('../../workers/json.worker.ts', import.meta.url), {
    type: 'module',
  })

  return worker
}

function processWithWorker(mode: JsonMode, value: string) {
  return new Promise<JsonWorkerResponse>((resolve, reject) => {
    const activeWorker = getWorker()

    activeWorker.onmessage = (event: MessageEvent<JsonWorkerResponse>) => {
      resolve(event.data)
    }

    activeWorker.onerror = () => {
      reject(new Error('JSON Worker 处理失败'))
    }

    activeWorker.postMessage({ mode, input: value } satisfies JsonWorkerRequest)
  })
}

function processWithoutWorker(mode: JsonMode, value: string): JsonWorkerResponse {
  const parsed = parseJson(value)

  if (!parsed.ok) {
    return parsed
  }

  return {
    ok: true,
    output: mode === 'minify'
      ? minifyJson(value)
      : mode === 'format'
        ? formatJson(value)
        : value,
    metadata: parsed,
  }
}

async function runJson(mode: JsonMode) {
  errorMessage.value = ''
  copied.value = false
  isProcessing.value = true

  try {
    const result = await processWithWorker(mode, input.value)

    if (!result.ok) {
      errorMessage.value = result.message
      metadata.value = result
      return
    }

    output.value = result.output
    metadata.value = result.metadata
  } catch {
    const result = processWithoutWorker(mode, input.value)

    if (!result.ok) {
      errorMessage.value = result.message
      metadata.value = result
      return
    }

    output.value = result.output
    metadata.value = result.metadata
  } finally {
    isProcessing.value = false
  }
}

function useSample() {
  input.value = sampleJson
  output.value = ''
  errorMessage.value = ''
  metadata.value = null
  copied.value = false
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  metadata.value = null
  copied.value = false
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
}

onBeforeUnmount(() => {
  worker?.terminate()
})
</script>

<template>
  <section class="grid gap-4">
    <div class="rounded-lg border border-border bg-card p-4 md:p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <FileJson2 class="h-4 w-4 text-primary" />
            <h2 class="text-base font-semibold text-foreground">JSON 工作区</h2>
          </div>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            在浏览器中本地格式化、压缩和校验 JSON。可用 Worker 时，大输入会在主线程之外处理。
          </p>
        </div>
        <Badge variant="secondary">{{ metadataLabel }}</Badge>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <Button type="button" :disabled="isProcessing" @click="runJson('format')">
          <Sparkles class="h-4 w-4" />
          格式化 JSON
        </Button>
        <Button type="button" variant="secondary" :disabled="isProcessing" @click="runJson('minify')">
          压缩 JSON
        </Button>
        <Button type="button" variant="outline" :disabled="isProcessing" @click="runJson('validate')">
          校验 JSON
        </Button>
        <Button type="button" variant="ghost" @click="useSample">
          <RotateCcw class="h-4 w-4" />
          示例
        </Button>
        <Button type="button" variant="ghost" @click="clearAll">
          <Trash2 class="h-4 w-4" />
          清空
        </Button>
        <Button type="button" variant="outline" :disabled="!canCopy" @click="copyOutput">
          <Check v-if="copied" class="h-4 w-4" />
          <Clipboard v-else class="h-4 w-4" />
          复制输出
        </Button>
      </div>

      <p v-if="errorMessage" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <label class="grid gap-2 rounded-lg border border-border bg-card p-4">
        <span class="text-sm font-medium text-foreground">输入</span>
        <Textarea
          v-model="input"
          aria-label="JSON 输入"
          spellcheck="false"
          placeholder='{"name":"Toolbox"}'
          class="min-h-[22rem] resize-y border-border bg-background/70 font-mono text-sm leading-6"
        />
      </label>

      <label class="grid gap-2 rounded-lg border border-border bg-card p-4">
        <span class="text-sm font-medium text-foreground">输出</span>
        <Textarea
          v-model="output"
          aria-label="JSON 输出"
          readonly
          spellcheck="false"
          placeholder="执行 JSON 操作后查看输出"
          class="min-h-[22rem] resize-y border-border bg-background/70 font-mono text-sm leading-6"
        />
      </label>
    </div>
  </section>
</template>
