<script setup lang="ts">
import { Check, Clipboard, FileJson2, RotateCcw, Sparkles, Trash2 } from '@lucide/vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/clipboard'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
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
const liveMessage = ref('')
let worker: Worker | null = null
let nextWorkerRequestId = 0
let latestRunId = 0

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
    const requestId = nextWorkerRequestId + 1
    nextWorkerRequestId = requestId

    const cleanup = () => {
      activeWorker.removeEventListener('message', handleMessage)
      activeWorker.removeEventListener('error', handleError)
    }

    const handleMessage = (event: MessageEvent<JsonWorkerResponse>) => {
      if (event.data.requestId !== requestId) {
        return
      }

      cleanup()
      resolve(event.data)
    }

    const handleError = () => {
      cleanup()
      reject(new Error('JSON Worker 处理失败'))
    }

    activeWorker.addEventListener('message', handleMessage)
    activeWorker.addEventListener('error', handleError)
    activeWorker.postMessage({ requestId, mode, input: value } satisfies JsonWorkerRequest)
  })
}

function processWithoutWorker(mode: JsonMode, value: string): JsonWorkerResponse {
  const parsed = parseJson(value)

  if (!parsed.ok) {
    return { requestId: 0, ...parsed }
  }

  return {
    requestId: 0,
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
  const runId = latestRunId + 1
  latestRunId = runId
  errorMessage.value = ''
  copied.value = false
  isProcessing.value = true

  try {
    const result = await processWithWorker(mode, input.value)

    if (runId !== latestRunId) {
      return
    }

    if (!result.ok) {
      errorMessage.value = result.message
      metadata.value = result
      liveMessage.value = result.message
      return
    }

    output.value = result.output
    metadata.value = result.metadata
    liveMessage.value = mode === 'format'
      ? 'JSON 已格式化'
      : mode === 'minify'
        ? 'JSON 已压缩'
        : 'JSON 校验通过'
  } catch {
    const result = processWithoutWorker(mode, input.value)

    if (runId !== latestRunId) {
      return
    }

    if (!result.ok) {
      errorMessage.value = result.message
      metadata.value = result
      liveMessage.value = result.message
      return
    }

    output.value = result.output
    metadata.value = result.metadata
    liveMessage.value = mode === 'format'
      ? 'JSON 已格式化'
      : mode === 'minify'
        ? 'JSON 已压缩'
        : 'JSON 校验通过'
  } finally {
    if (runId === latestRunId) {
      isProcessing.value = false
    }
  }
}

function useSample() {
  input.value = sampleJson
  output.value = ''
  errorMessage.value = ''
  metadata.value = null
  copied.value = false
  liveMessage.value = 'JSON 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  metadata.value = null
  copied.value = false
  liveMessage.value = 'JSON 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  const result = await copyToClipboard(output.value)

  if (!result.ok) {
    liveMessage.value = result.message
    return
  }

  copied.value = true
  liveMessage.value = 'JSON 输出已复制'
}

onBeforeUnmount(() => {
  worker?.terminate()
})
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="JSON 工作区"
      description="在浏览器中本地格式化、压缩和校验 JSON。可用 Worker 时，大输入会在主线程之外处理。"
      :meta="metadataLabel"
    >
      <template #icon>
        <FileJson2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="isProcessing" @click="runJson('format')">
            <Sparkles class="h-4 w-4" />
            格式化 JSON
          </Button>
        </template>

        <template #secondary>
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
        </template>
      </ToolActionBar>

      <p
        v-if="errorMessage"
        role="alert"
        class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel
        v-model="input"
        label="输入"
        ariaLabel="JSON 输入"
        placeholder='{"name":"Toolbox"}'
        min-height-class="min-h-[22rem]"
        empty-message="粘贴对象、数组或任意有效 JSON。内容只在浏览器中处理。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="JSON 输出"
        readonly
        placeholder="执行 JSON 操作后查看输出"
        min-height-class="min-h-[22rem]"
        empty-message="格式化、压缩或校验后，结果会留在本机浏览器。"
      />
    </div>
  </section>
</template>
