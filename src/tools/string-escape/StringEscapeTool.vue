<script setup lang="ts">
import { Check, Clipboard, Code2, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { transformStringEscape, type StringEscapeMode, type StringEscapeOperation } from './string-escape'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('Hello "Vue"\n工具箱')
const output = ref('')
const mode = ref<StringEscapeMode>('json')
const operation = ref<StringEscapeOperation>('escape')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('JSON / SQL')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function run() {
  resetFeedback()
  const result = transformStringEscape(input.value, {
    mode: mode.value,
    operation: operation.value,
  })

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = `${mode.value} ${operation.value}`
  liveMessage.value = '字符串转义已完成'
}

function useSample() {
  input.value = 'Hello "Vue"\n工具箱'
  output.value = ''
  mode.value = 'json'
  operation.value = 'escape'
  resetFeedback()
  meta.value = 'JSON / SQL'
  liveMessage.value = '字符串转义示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'JSON / SQL'
  liveMessage.value = '字符串转义工作区已清空'
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
  liveMessage.value = '字符串转义结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="字符串转义" description="在 JSON、JavaScript、Python 和 SQL 字符串内容之间执行转义与反转义。" :meta="meta">
      <template #icon>
        <Code2 class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          目标格式
          <select v-model="mode" aria-label="字符串转义格式" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="json">JSON</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="sql">SQL</option>
          </select>
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          操作
          <select v-model="operation" aria-label="字符串转义操作" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="escape">转义</option>
            <option value="unescape">反转义</option>
          </select>
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="run">
            转换字符串
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
            复制输出
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="input" label="输入字符串" ariaLabel="字符串转义输入" placeholder="粘贴字符串内容" min-height-class="min-h-[22rem]" />
      <ToolTextareaPanel v-model="output" label="转换结果" ariaLabel="字符串转义输出" readonly placeholder="点击转换字符串" min-height-class="min-h-[22rem]" empty-message="转义或反转义后的字符串会显示在这里。" />
    </div>
  </section>
</template>
