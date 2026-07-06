<script setup lang="ts">
import { Check, Clipboard, FileText, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { summarizeHar } from './har-viewer'

const sample = JSON.stringify({
  log: {
    entries: [
      {
        request: { method: 'GET', url: 'https://example.com/api/users' },
        response: { status: 200, content: { mimeType: 'application/json', size: 128 } },
        time: 42.4,
      },
    ],
  },
}, null, 2)
const input = ref(sample)
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('HAR JSON')

const canCopy = computed(() => output.value.length > 0)

function summarize() {
  errorMessage.value = ''
  copied.value = false
  const result = summarizeHar(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.entryCount} entries`
  liveMessage.value = 'HAR 已汇总'
}

function useSample() {
  input.value = sample
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'HAR JSON'
  liveMessage.value = 'HAR 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'HAR JSON'
  liveMessage.value = 'HAR 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'HAR 摘要已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="HAR Viewer" description="解析浏览器导出的 HAR JSON，汇总请求、状态、MIME、大小和耗时。" :meta="meta">
      <template #icon>
        <FileText class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="summarize">
            汇总 HAR
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
      <ToolTextareaPanel v-model="input" label="HAR JSON" ariaLabel="HAR JSON 输入" placeholder="粘贴 HAR JSON" min-height-class="min-h-[28rem]" />
      <ToolTextareaPanel v-model="output" label="HAR 摘要" ariaLabel="HAR 摘要输出" readonly placeholder="点击汇总 HAR" min-height-class="min-h-[28rem]" empty-message="请求摘要和总大小/耗时会显示在这里。" />
    </div>
  </section>
</template>
