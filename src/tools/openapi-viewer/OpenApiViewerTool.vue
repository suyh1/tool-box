<script setup lang="ts">
import { Check, Clipboard, FileText, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { validateOpenApiSpec } from './openapi-viewer'
import { copyToClipboard } from '@/lib/clipboard'

const sample = `openapi: 3.0.3
info:
  title: Demo API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users`
const input = ref(sample)
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('YAML / JSON')

const canCopy = computed(() => output.value.length > 0)

function validate() {
  errorMessage.value = ''
  copied.value = false
  const result = validateOpenApiSpec(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.operationCount} operations`
  liveMessage.value = 'OpenAPI 文档已校验'
}

function useSample() {
  input.value = sample
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'YAML / JSON'
  liveMessage.value = 'OpenAPI 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'YAML / JSON'
  liveMessage.value = 'OpenAPI 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  const clipboardResult = await copyToClipboard(output.value)
  if (!clipboardResult.ok) {
    liveMessage.value = clipboardResult.message
    return
  }
  copied.value = true
  liveMessage.value = 'OpenAPI 摘要已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="OpenAPI Viewer / Validator" description="解析 OpenAPI YAML/JSON，检查必需字段并汇总 path operation。" :meta="meta">
      <template #icon>
        <FileText class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="validate">
            校验 OpenAPI
          </Button>
        </template>

        <template #secondary>
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
            复制摘要
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="input" label="OpenAPI 文档" ariaLabel="OpenAPI 输入" placeholder="粘贴 OpenAPI YAML 或 JSON" min-height-class="min-h-[28rem]" />
      <ToolTextareaPanel v-model="output" label="校验摘要" ariaLabel="OpenAPI 校验摘要" readonly placeholder="点击校验 OpenAPI" min-height-class="min-h-[28rem]" empty-message="API 标题、版本、paths 和 operations 会显示在这里。" />
    </div>
  </section>
</template>
