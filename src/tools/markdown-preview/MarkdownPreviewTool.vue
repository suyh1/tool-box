<script setup lang="ts">
import { Check, Clipboard, FileText, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import {
  renderMarkdownPreview,
  type MarkdownHeading,
  type MarkdownPreviewStats,
} from './markdown-preview'

const sampleMarkdown = [
  '# Release Notes',
  '',
  'Hello **world**. This preview keeps raw HTML escaped.',
  '',
  '## Changes',
  '',
  '- Added CSV table tools',
  '- Generated SQL INSERT statements',
  '',
  '```ts',
  'const localOnly = true',
  '```',
].join('\n')

const input = ref('')
const html = ref('')
const headings = ref<MarkdownHeading[]>([])
const stats = ref<MarkdownPreviewStats | null>(null)
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => html.value.length > 0)
const metaLabel = computed(() => stats.value
  ? `${stats.value.wordCount} 词 / ${stats.value.readingMinutes} 分钟`
  : '等待 Markdown')

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function renderPreview() {
  resetFeedback()

  const result = renderMarkdownPreview(input.value)

  if (!result.ok) {
    html.value = ''
    headings.value = []
    stats.value = null
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  html.value = result.html
  headings.value = result.headings
  stats.value = result.stats
  liveMessage.value = 'Markdown 预览已生成'
}

function useSample() {
  input.value = sampleMarkdown
  html.value = ''
  headings.value = []
  stats.value = null
  resetFeedback()
  liveMessage.value = 'Markdown 示例已载入'
}

function clearAll() {
  input.value = ''
  html.value = ''
  headings.value = []
  stats.value = null
  resetFeedback()
  liveMessage.value = 'Markdown 工作区已清空'
}

async function copyHtml() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(html.value)
  copied.value = true
  liveMessage.value = 'Markdown HTML 已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="Markdown 预览"
      description="在本地渲染 Markdown，查看标题结构、字数和转义后的 HTML 预览。"
      :meta="metaLabel"
    >
      <template #icon>
        <FileText class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="renderPreview">
            <FileText class="h-4 w-4" />
            渲染预览
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
          <Button type="button" variant="outline" :disabled="!canCopy" @click="copyHtml">
            <Check v-if="copied" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制 HTML
          </Button>
        </template>
      </ToolActionBar>

      <dl
        v-if="stats"
        class="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-4"
      >
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">标题</dt>
          <dd class="mt-1 font-mono text-foreground">{{ stats.headingCount }}</dd>
        </div>
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">行数</dt>
          <dd class="mt-1 font-mono text-foreground">{{ stats.lineCount }}</dd>
        </div>
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">词数</dt>
          <dd class="mt-1 font-mono text-foreground">{{ stats.wordCount }}</dd>
        </div>
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">阅读</dt>
          <dd class="mt-1 font-mono text-foreground">{{ stats.readingMinutes }} min</dd>
        </div>
      </dl>

      <p
        v-if="errorMessage"
        role="alert"
        class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <div class="grid gap-4 xl:grid-cols-[minmax(20rem,0.9fr)_minmax(24rem,1.1fr)]">
      <ToolTextareaPanel
        v-model="input"
        label="Markdown 输入"
        ariaLabel="Markdown 输入"
        placeholder="# Title"
        min-height-class="min-h-[34rem]"
        empty-message="粘贴 README、发布说明或文档片段。原始 HTML 会作为文本显示，不会直接执行。"
      />

      <div class="grid gap-4">
        <section class="tool-field grid gap-3 rounded-lg border border-border bg-card p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-0">
              <h3 class="text-sm font-medium text-foreground">预览</h3>
              <p class="mt-1 text-xs leading-5 text-muted-foreground">
                {{ html ? 'Markdown 已渲染为安全预览。' : '渲染后查看排版结果。' }}
              </p>
            </div>
          </div>

          <div
            v-if="html"
            class="markdown-preview min-h-[22rem] overflow-auto rounded-md border border-border bg-background/65 p-5"
            v-html="html"
          />
          <p
            v-else
            class="grid min-h-[22rem] place-items-center rounded-md border border-dashed border-border bg-background/35 px-4 text-center text-sm text-muted-foreground"
          >
            点击渲染预览后查看文档。
          </p>
        </section>

        <section class="tool-field grid gap-3 rounded-lg border border-border bg-card p-4">
          <div>
            <h3 class="text-sm font-medium text-foreground">标题结构</h3>
            <p class="mt-1 text-xs leading-5 text-muted-foreground">
              {{ headings.length ? `${headings.length} 个标题` : '渲染后显示标题结构。' }}
            </p>
          </div>
          <ol v-if="headings.length" class="grid gap-2 text-sm">
            <li
              v-for="heading in headings"
              :key="heading.slug"
              class="rounded-md border border-border bg-background/45 px-3 py-2"
              :style="{ marginLeft: `${(heading.level - 1) * 0.8}rem` }"
            >
              <span class="font-mono text-xs text-muted-foreground">H{{ heading.level }}</span>
              <span class="ml-2 text-foreground">{{ heading.text }}</span>
            </li>
          </ol>
          <p
            v-else
            class="rounded-md border border-dashed border-border bg-background/35 px-3 py-4 text-sm text-muted-foreground"
          >
            暂无标题。
          </p>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.markdown-preview {
  color: var(--foreground);
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3) {
  margin: 1.2rem 0 0.65rem;
  font-weight: 700;
  line-height: 1.2;
}

.markdown-preview :deep(h1) {
  margin-top: 0;
  font-size: 1.75rem;
}

.markdown-preview :deep(h2) {
  font-size: 1.35rem;
}

.markdown-preview :deep(h3) {
  font-size: 1.1rem;
}

.markdown-preview :deep(p),
.markdown-preview :deep(ul),
.markdown-preview :deep(ol),
.markdown-preview :deep(blockquote),
.markdown-preview :deep(pre),
.markdown-preview :deep(table) {
  margin: 0.85rem 0;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  padding-left: 1.4rem;
}

.markdown-preview :deep(ul) {
  list-style: disc;
}

.markdown-preview :deep(ol) {
  list-style: decimal;
}

.markdown-preview :deep(a) {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.markdown-preview :deep(code) {
  border: 1px solid color-mix(in oklch, var(--border) 78%, transparent);
  border-radius: 0.35rem;
  background: color-mix(in oklch, var(--muted) 70%, transparent);
  padding: 0.1rem 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.88em;
}

.markdown-preview :deep(pre) {
  overflow: auto;
  border: 1px solid color-mix(in oklch, var(--border) 78%, transparent);
  border-radius: 0.5rem;
  background: color-mix(in oklch, var(--muted) 55%, transparent);
  padding: 0.9rem;
}

.markdown-preview :deep(pre code) {
  border: 0;
  background: transparent;
  padding: 0;
}

.markdown-preview :deep(blockquote) {
  border-left: 3px solid var(--primary);
  padding-left: 0.9rem;
  color: var(--muted-foreground);
}

.markdown-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid var(--border);
  padding: 0.5rem 0.65rem;
}

.markdown-preview :deep(th) {
  background: var(--muted);
}
</style>
