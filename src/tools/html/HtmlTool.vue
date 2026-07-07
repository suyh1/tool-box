<script setup lang="ts">
import { Check, Clipboard, Code2, RotateCcw, Sparkles, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { formatHtml, minifyHtml } from './html'
import { copyToClipboard } from '@/lib/clipboard'

const sampleHtml = '<main><h1>Hello</h1><p data-id="1">World</p></main>'

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const meta = ref('等待 HTML')
const copied = ref(false)
const liveMessage = ref('')
const isRunning = ref(false)

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

async function runAction(action: 'format' | 'minify') {
  resetFeedback()
  isRunning.value = true

  const result = action === 'format'
    ? await formatHtml(input.value)
    : minifyHtml(input.value)

  isRunning.value = false

  if (!result.ok) {
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = result.meta
  liveMessage.value = result.meta
}

function useSample() {
  input.value = sampleHtml
  output.value = ''
  errorMessage.value = ''
  meta.value = '示例已载入'
  copied.value = false
  liveMessage.value = 'HTML 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  meta.value = '等待 HTML'
  copied.value = false
  liveMessage.value = 'HTML 工作区已清空'
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
  liveMessage.value = 'HTML 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="HTML 格式化"
      description="格式化或压缩 HTML 片段，适合整理模板、页面片段和接口返回的标记文本。"
      :meta="meta"
    >
      <template #icon>
        <Code2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input || isRunning" @click="runAction('format')">
            <Sparkles class="h-4 w-4" />
            格式化 HTML
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input || isRunning" @click="runAction('minify')">
            压缩 HTML
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
        label="HTML 输入"
        ariaLabel="HTML 输入"
        :placeholder="sampleHtml"
        min-height-class="min-h-[30rem]"
        empty-message="粘贴 HTML 文档、组件模板或页面片段。格式化过程只在浏览器本地运行。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="HTML 输出"
        ariaLabel="HTML 输出"
        readonly
        placeholder="执行操作后查看输出"
        min-height-class="min-h-[30rem]"
        empty-message="格式化或压缩后的 HTML 会显示在这里。"
      />
    </div>
  </section>
</template>
