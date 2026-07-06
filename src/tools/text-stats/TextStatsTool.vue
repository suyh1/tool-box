<script setup lang="ts">
import { BarChart3, Check, Clipboard, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { analyzeTextStats, type TextStats } from './text-stats'

const input = ref('Hello 世界\n\nOne more line.')
const output = ref('')
const stats = ref<TextStats | null>(null)
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('chars / words / bytes')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  copied.value = false
}

function analyze() {
  resetFeedback()
  const result = analyzeTextStats(input.value)
  stats.value = result
  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.characters} chars / ${result.words} words`
  liveMessage.value = '文本统计已更新'
}

function useSample() {
  input.value = 'Hello 世界\n\nOne more line.'
  output.value = ''
  stats.value = null
  resetFeedback()
  meta.value = 'chars / words / bytes'
  liveMessage.value = '文本统计示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  stats.value = null
  resetFeedback()
  meta.value = 'chars / words / bytes'
  liveMessage.value = '文本统计工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '文本统计 JSON 已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="文本统计" description="统计字符、词、行、段落、句子、UTF-8 字节和唯一词数量。" :meta="meta">
      <template #icon>
        <BarChart3 class="h-4 w-4 text-primary" />
      </template>

      <div v-if="stats" class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div v-for="(value, key) in stats" :key="key" class="rounded-lg border border-border bg-background/55 p-3">
          <div class="text-xs text-muted-foreground">{{ key }}</div>
          <div class="mt-1 font-mono text-lg font-semibold text-foreground">{{ value }}</div>
        </div>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="analyze">
            统计文本
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

    <ToolTextareaPanel
      v-model="input"
      label="输入文本"
      ariaLabel="文本统计输入"
      placeholder="粘贴需要统计的文本"
      min-height-class="min-h-[16rem]"
    />

    <ToolTextareaPanel
      v-model="output"
      label="统计 JSON"
      ariaLabel="文本统计 JSON"
      readonly
      placeholder="点击统计文本"
      min-height-class="min-h-[16rem]"
      empty-message="统计结果会以 JSON 形式显示在这里。"
    />
  </section>
</template>
