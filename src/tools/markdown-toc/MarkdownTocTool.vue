<script setup lang="ts">
import { Check, Clipboard, ListTree, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generateMarkdownToc } from './markdown-toc'
import { copyToClipboard } from '@/lib/clipboard'

const sampleMarkdown = [
  '# Guide',
  '',
  '## Install',
  '',
  '### Local Setup',
  '',
  '## Usage',
  '',
  '### CLI',
].join('\n')

const input = ref('')
const output = ref('')
const minLevel = ref(2)
const maxLevel = ref(6)
const ordered = ref(false)
const errorMessage = ref('')
const copied = ref(false)
const meta = ref('等待 Markdown')
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function generateToc() {
  resetFeedback()

  const result = generateMarkdownToc(input.value, {
    minLevel: minLevel.value,
    maxLevel: maxLevel.value,
    ordered: ordered.value,
  })

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = result.meta
  liveMessage.value = result.meta
}

function useSample() {
  input.value = sampleMarkdown
  output.value = ''
  meta.value = '示例已载入'
  resetFeedback()
  liveMessage.value = 'Markdown TOC 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  meta.value = '等待 Markdown'
  resetFeedback()
  liveMessage.value = 'Markdown TOC 工作区已清空'
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
  liveMessage.value = 'Markdown TOC 已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="Markdown TOC 生成"
      description="从 Markdown 标题生成可复制的目录链接，支持标题级别范围和有序列表输出。"
      :meta="meta"
    >
      <template #icon>
        <ListTree class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="generateToc">
            <ListTree class="h-4 w-4" />
            生成目录
          </Button>
        </template>

        <template #secondary>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            起始
            <select
              v-model.number="minLevel"
              class="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="TOC 起始标题级别"
            >
              <option v-for="level in 6" :key="level" :value="level">H{{ level }}</option>
            </select>
          </label>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            结束
            <select
              v-model.number="maxLevel"
              class="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="TOC 结束标题级别"
            >
              <option v-for="level in 6" :key="level" :value="level">H{{ level }}</option>
            </select>
          </label>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="ordered" type="checkbox" class="h-4 w-4 accent-primary">
            有序列表
          </label>
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
        label="Markdown 输入"
        ariaLabel="Markdown TOC 输入"
        placeholder="# Guide&#10;&#10;## Install"
        min-height-class="min-h-[30rem]"
        empty-message="粘贴 README、文档或发布说明。默认从 H2 开始生成，适合跳过页面主标题。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="TOC 输出"
        ariaLabel="Markdown TOC 输出"
        readonly
        placeholder="- [Install](#install)"
        min-height-class="min-h-[30rem]"
        empty-message="生成后的目录会保留 Markdown 链接格式，可直接复制回文档。"
      />
    </div>
  </section>
</template>
