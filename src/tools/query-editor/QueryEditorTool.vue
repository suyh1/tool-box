<script setup lang="ts">
import { Check, Clipboard, ListFilter, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { buildQueryString, parseQueryString, setQueryParam } from './query-editor'

const input = ref('?q=vue&tag=tool&tag=dev&empty=')
const urlInput = ref('https://example.com/search?q=old')
const paramKey = ref('q')
const paramValue = ref('new value')
const output = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('query params')

const canCopy = computed(() => output.value.length > 0)

function parseQuery() {
  copied.value = false
  const params = parseQueryString(input.value)
  output.value = JSON.stringify(params, null, 2)
  meta.value = `${params.length} params`
  liveMessage.value = 'Query 参数已解析'
}

function rebuildQuery() {
  copied.value = false
  const params = parseQueryString(input.value)
  output.value = buildQueryString(params)
  meta.value = `${params.length} params`
  liveMessage.value = 'Query 字符串已重建'
}

function updateUrlParam() {
  copied.value = false
  try {
    output.value = setQueryParam(urlInput.value, paramKey.value, paramValue.value)
    meta.value = 'URL updated'
    liveMessage.value = 'URL 参数已更新'
  } catch {
    output.value = ''
    liveMessage.value = '请输入有效 URL'
  }
}

function useSample() {
  input.value = '?q=vue&tag=tool&tag=dev&empty='
  urlInput.value = 'https://example.com/search?q=old'
  paramKey.value = 'q'
  paramValue.value = 'new value'
  output.value = ''
  copied.value = false
  meta.value = 'query params'
  liveMessage.value = 'Query 参数示例已载入'
}

function clearAll() {
  input.value = ''
  urlInput.value = ''
  paramKey.value = ''
  paramValue.value = ''
  output.value = ''
  copied.value = false
  meta.value = 'query params'
  liveMessage.value = 'Query 参数工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'Query 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Query 参数编辑器" description="解析 query 字符串，重建编码结果，或更新完整 URL 中的指定参数。" :meta="meta">
      <template #icon>
        <ListFilter class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4">
        <Input v-model="input" aria-label="Query 字符串" placeholder="?q=vue&tag=tool" />
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1fr)]">
          <Input v-model="urlInput" aria-label="完整 URL" placeholder="https://example.com/search?q=old" />
          <Input v-model="paramKey" aria-label="参数名" placeholder="q" />
          <Input v-model="paramValue" aria-label="参数值" placeholder="new value" />
        </div>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="parseQuery">
            解析 Query
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" @click="rebuildQuery">
            重建 Query
          </Button>
          <Button type="button" variant="secondary" @click="updateUrlParam">
            更新 URL
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
    </ToolPanel>

    <ToolTextareaPanel v-model="output" label="输出" ariaLabel="Query 参数编辑器输出" readonly placeholder="点击解析或重建 Query" min-height-class="min-h-[18rem]" empty-message="参数 JSON、query 字符串或更新后的 URL 会显示在这里。" />
  </section>
</template>
