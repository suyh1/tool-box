<script setup lang="ts">
import { Check, Clipboard, FileText, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generateLoremIpsum } from './lorem-ipsum'
import { copyToClipboard } from '@/lib/clipboard'

const paragraphs = ref(3)
const sentencesPerParagraph = ref(4)
const wordsPerSentence = ref(12)
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('3 paragraphs')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function generateText() {
  resetFeedback()
  const result = generateLoremIpsum({
    paragraphs: paragraphs.value,
    sentencesPerParagraph: sentencesPerParagraph.value,
    wordsPerSentence: wordsPerSentence.value,
  })

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.text
  meta.value = `${result.paragraphCount} 段 / ${result.wordCount} 词`
  liveMessage.value = 'Lorem Ipsum 已生成'
}

function useSample() {
  paragraphs.value = 3
  sentencesPerParagraph.value = 4
  wordsPerSentence.value = 12
  output.value = ''
  resetFeedback()
  meta.value = '3 paragraphs'
  liveMessage.value = 'Lorem Ipsum 示例选项已载入'
}

function clearAll() {
  output.value = ''
  resetFeedback()
  meta.value = `${paragraphs.value} paragraphs`
  liveMessage.value = 'Lorem Ipsum 输出已清空'
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
  liveMessage.value = 'Lorem Ipsum 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Lorem Ipsum 生成器" description="生成本地占位文本，用于排版、文档和 UI 草稿。" :meta="meta">
      <template #icon>
        <FileText class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          段落
          <Input v-model.number="paragraphs" type="number" min="1" max="20" step="1" aria-label="段落数量" />
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          每段句数
          <Input v-model.number="sentencesPerParagraph" type="number" min="1" max="12" step="1" aria-label="每段句数" />
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          每句词数
          <Input v-model.number="wordsPerSentence" type="number" min="3" max="40" step="1" aria-label="每句词数" />
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="generateText">
            生成文本
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

      <p
        v-if="errorMessage"
        role="alert"
        class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel
      v-model="output"
      label="生成结果"
      ariaLabel="Lorem Ipsum 生成结果"
      readonly
      placeholder="点击生成文本"
      min-height-class="min-h-[24rem]"
      empty-message="生成的占位文本会显示在这里。"
    />
  </section>
</template>
