<script setup lang="ts">
import { Check, Clipboard, FileText, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { parseTemplateRows, renderTemplateRows } from './template-replace'
import { copyToClipboard } from '@/lib/clipboard'

const template = ref('user {{id}}: {{name}}')
const data = ref('[{"name":"Ada","id":1},{"name":"Linus","id":2}]')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('{{variables}}')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function render() {
  resetFeedback()
  const rows = parseTemplateRows(data.value)

  if (!rows.ok) {
    output.value = ''
    errorMessage.value = rows.message
    liveMessage.value = rows.message
    return
  }

  const result = renderTemplateRows(template.value, rows.rows)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.output
  meta.value = `${rows.rows.length} rows`
  liveMessage.value = result.missingKeys.length
    ? `模板已渲染，缺少 ${result.missingKeys.length} 个键`
    : '模板已渲染'
}

function useSample() {
  template.value = 'user {{id}}: {{name}}'
  data.value = '[{"name":"Ada","id":1},{"name":"Linus","id":2}]'
  output.value = ''
  resetFeedback()
  meta.value = '{{variables}}'
  liveMessage.value = '文本模板示例已载入'
}

function clearAll() {
  template.value = ''
  data.value = ''
  output.value = ''
  resetFeedback()
  meta.value = '{{variables}}'
  liveMessage.value = '文本模板工作区已清空'
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
  liveMessage.value = '模板输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="文本模板替换" description="用 JSON 对象或对象数组批量替换 {{变量}} 占位符。" :meta="meta">
      <template #icon>
        <FileText class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="render">
            渲染模板
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

    <div class="grid gap-4 lg:grid-cols-3">
      <ToolTextareaPanel v-model="template" label="模板" ariaLabel="文本模板" placeholder="Hello {{name}}" min-height-class="min-h-[22rem]" />
      <ToolTextareaPanel v-model="data" label="JSON 数据" ariaLabel="模板替换 JSON 数据" placeholder='{"name":"Ada"}' min-height-class="min-h-[22rem]" />
      <ToolTextareaPanel v-model="output" label="渲染结果" ariaLabel="模板替换输出" readonly placeholder="点击渲染模板" min-height-class="min-h-[22rem]" empty-message="每条数据渲染出的文本会显示在这里。" />
    </div>
  </section>
</template>
