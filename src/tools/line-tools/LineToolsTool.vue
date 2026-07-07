<script setup lang="ts">
import { ArrowDownAZ, Check, Clipboard, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { processLines, type LineSortMode } from './line-tools'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref(' beta\nalpha\n\nbeta \ngamma')
const output = ref('')
const trimLines = ref(true)
const removeEmpty = ref(true)
const unique = ref(true)
const caseSensitive = ref(true)
const sort = ref<LineSortMode>('asc')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('sort / unique')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  copied.value = false
}

function run() {
  resetFeedback()
  const result = processLines(input.value, {
    trimLines: trimLines.value,
    removeEmpty: removeEmpty.value,
    sort: sort.value,
    unique: unique.value,
    caseSensitive: caseSensitive.value,
  })

  output.value = result.output
  meta.value = `${result.stats.outputLines} lines`
  liveMessage.value = `输出 ${result.stats.outputLines} 行，移除 ${result.stats.removedDuplicates} 个重复项`
}

function useSample() {
  input.value = ' beta\nalpha\n\nbeta \ngamma'
  output.value = ''
  trimLines.value = true
  removeEmpty.value = true
  unique.value = true
  caseSensitive.value = true
  sort.value = 'asc'
  resetFeedback()
  meta.value = 'sort / unique'
  liveMessage.value = '行工具示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'sort / unique'
  liveMessage.value = '行工具工作区已清空'
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
  liveMessage.value = '行处理结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="行排序 / 去重" description="对多行文本执行修剪、去空行、排序和去重，适合整理 ID、日志片段和列表。" :meta="meta">
      <template #icon>
        <ArrowDownAZ class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 md:grid-cols-[12rem_repeat(4,minmax(0,1fr))]">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          排序
          <select v-model="sort" aria-label="行排序方式" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="none">不排序</option>
            <option value="asc">升序</option>
            <option value="desc">降序</option>
          </select>
        </label>
        <label class="flex items-center gap-2 rounded-md border border-border bg-background/55 px-3 py-2 text-sm text-foreground">
          <input v-model="trimLines" type="checkbox" class="h-4 w-4 accent-primary">
          修剪空白
        </label>
        <label class="flex items-center gap-2 rounded-md border border-border bg-background/55 px-3 py-2 text-sm text-foreground">
          <input v-model="removeEmpty" type="checkbox" class="h-4 w-4 accent-primary">
          去空行
        </label>
        <label class="flex items-center gap-2 rounded-md border border-border bg-background/55 px-3 py-2 text-sm text-foreground">
          <input v-model="unique" type="checkbox" class="h-4 w-4 accent-primary">
          去重
        </label>
        <label class="flex items-center gap-2 rounded-md border border-border bg-background/55 px-3 py-2 text-sm text-foreground">
          <input v-model="caseSensitive" type="checkbox" class="h-4 w-4 accent-primary">
          区分大小写
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="run">
            处理行
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
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel
        v-model="input"
        label="输入行"
        ariaLabel="行排序去重输入"
        placeholder="每行一个值"
        min-height-class="min-h-[24rem]"
      />
      <ToolTextareaPanel
        v-model="output"
        label="处理结果"
        ariaLabel="行排序去重输出"
        readonly
        placeholder="点击处理行"
        min-height-class="min-h-[24rem]"
        empty-message="排序、去重后的多行文本会显示在这里。"
      />
    </div>
  </section>
</template>
