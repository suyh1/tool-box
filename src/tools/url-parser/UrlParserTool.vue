<script setup lang="ts">
import { Check, Clipboard, Link, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { parseUrlDetails } from './url-parser'

const input = ref('https://user:pass@example.com:8443/a/b?x=1&x=2&empty=#top')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('URL components')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function parse() {
  resetFeedback()
  const result = parseUrlDetails(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = result.hostname
  liveMessage.value = 'URL 已解析'
}

function useSample() {
  input.value = 'https://user:pass@example.com:8443/a/b?x=1&x=2&empty=#top'
  output.value = ''
  resetFeedback()
  meta.value = 'URL components'
  liveMessage.value = 'URL 解析示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'URL components'
  liveMessage.value = 'URL 解析工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'URL 解析结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="URL 解析器" description="解析 URL 的协议、账号、主机、路径、hash 和重复 query 参数。" :meta="meta">
      <template #icon>
        <Link class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4">
        <Input v-model="input" aria-label="待解析 URL" placeholder="https://example.com/path?x=1#top" />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="parse">
            解析 URL
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

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel v-model="output" label="解析结果" ariaLabel="URL 解析结果" readonly placeholder="点击解析 URL" min-height-class="min-h-[24rem]" empty-message="URL 组件和 query 参数会显示在这里。" />
  </section>
</template>
