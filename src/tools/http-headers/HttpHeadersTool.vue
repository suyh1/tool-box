<script setup lang="ts">
import { Check, Clipboard, FileText, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { parseHttpHeaders } from './http-headers'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('HTTP/1.1 200 OK\nContent-Type: application/json\nSet-Cookie: a=1\nSet-Cookie: b=2')
const output = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('raw headers')

const canCopy = computed(() => output.value.length > 0)

function parse() {
  copied.value = false
  const result = parseHttpHeaders(input.value)
  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.headers.length} headers`
  liveMessage.value = 'HTTP Header 已解析'
}

function useSample() {
  input.value = 'HTTP/1.1 200 OK\nContent-Type: application/json\nSet-Cookie: a=1\nSet-Cookie: b=2'
  output.value = ''
  copied.value = false
  meta.value = 'raw headers'
  liveMessage.value = 'HTTP Header 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  copied.value = false
  meta.value = 'raw headers'
  liveMessage.value = 'HTTP Header 工作区已清空'
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
  liveMessage.value = 'HTTP Header 结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="HTTP Header 解析器" description="把原始 HTTP 请求或响应头解析成有序列表和按小写键分组的 JSON。" :meta="meta">
      <template #icon>
        <FileText class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="parse">
            解析 Header
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
            复制 JSON
          </Button>
        </template>
      </ToolActionBar>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="input" label="原始 Header" ariaLabel="HTTP Header 输入" placeholder="HTTP/1.1 200 OK" min-height-class="min-h-[24rem]" />
      <ToolTextareaPanel v-model="output" label="解析结果" ariaLabel="HTTP Header 输出" readonly placeholder="点击解析 Header" min-height-class="min-h-[24rem]" empty-message="Header 列表和 JSON 对象会显示在这里。" />
    </div>
  </section>
</template>
