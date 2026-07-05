<script setup lang="ts">
import { Check, Clipboard, GitCompare, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { diffLines, summarizeDiff, type DiffRow, type DiffSummary } from './diff'

const sampleLeft = 'alpha\nbravo\ncharlie\ndelta'
const sampleRight = 'alpha\nbravo updated\ncharlie\necho'

const leftText = ref('')
const rightText = ref('')
const rows = ref<DiffRow[]>([])
const summary = ref<DiffSummary>({ added: 0, removed: 0, unchanged: 0 })
const hasRun = ref(false)
const copied = ref(false)

const resultLabel = computed(() => {
  if (!hasRun.value) {
    return '等待对比'
  }

  return `新增 ${summary.value.added} / 删除 ${summary.value.removed}`
})

const copyText = computed(() => rows.value.map((row) => `${rowMarker(row)} ${row.value}`).join('\n'))

function runDiff() {
  rows.value = diffLines(leftText.value, rightText.value)
  summary.value = summarizeDiff(rows.value)
  hasRun.value = true
  copied.value = false
}

function useSample() {
  leftText.value = sampleLeft
  rightText.value = sampleRight
  rows.value = []
  summary.value = { added: 0, removed: 0, unchanged: 0 }
  hasRun.value = false
  copied.value = false
}

function clearAll() {
  leftText.value = ''
  rightText.value = ''
  rows.value = []
  summary.value = { added: 0, removed: 0, unchanged: 0 }
  hasRun.value = false
  copied.value = false
}

function rowMarker(row: DiffRow) {
  if (row.type === 'added') {
    return '+'
  }

  if (row.type === 'removed') {
    return '-'
  }

  return ' '
}

function rowClass(row: DiffRow) {
  if (row.type === 'added') {
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
  }

  if (row.type === 'removed') {
    return 'border-rose-500/25 bg-rose-500/10 text-rose-900 dark:text-rose-100'
  }

  return 'border-border bg-background/70 text-foreground'
}

function lineLabel(row: DiffRow) {
  const oldLine = row.oldLineNumber ? String(row.oldLineNumber) : '-'
  const newLine = row.newLineNumber ? String(row.newLineNumber) : '-'

  return `${oldLine} -> ${newLine}`
}

async function copyDiff() {
  if (!copyText.value) {
    return
  }

  await navigator.clipboard.writeText(copyText.value)
  copied.value = true
}
</script>

<template>
  <section class="grid gap-4">
    <div class="rounded-lg border border-border bg-card p-4 md:p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-foreground">文本对比</h2>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            在浏览器中按行对比两段文本，标记新增、删除和未变化内容。
          </p>
        </div>
        <Badge variant="secondary">{{ resultLabel }}</Badge>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <Button type="button" @click="runDiff">
          <GitCompare class="h-4 w-4" />
          对比文本
        </Button>
        <Button type="button" variant="ghost" @click="useSample">
          <RotateCcw class="h-4 w-4" />
          示例
        </Button>
        <Button type="button" variant="ghost" @click="clearAll">
          <Trash2 class="h-4 w-4" />
          清空
        </Button>
        <Button type="button" variant="outline" :disabled="!copyText" @click="copyDiff">
          <Check v-if="copied" class="h-4 w-4" />
          <Clipboard v-else class="h-4 w-4" />
          复制差异
        </Button>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <label class="grid gap-2 rounded-lg border border-border bg-card p-4">
        <span class="text-sm font-medium text-foreground">原文本</span>
        <Textarea
          v-model="leftText"
          aria-label="文本对比原文本"
          spellcheck="false"
          placeholder="alpha&#10;bravo"
          class="min-h-[18rem] resize-y border-border bg-background/70 font-mono text-sm leading-6"
        />
      </label>

      <label class="grid gap-2 rounded-lg border border-border bg-card p-4">
        <span class="text-sm font-medium text-foreground">新文本</span>
        <Textarea
          v-model="rightText"
          aria-label="文本对比新文本"
          spellcheck="false"
          placeholder="alpha&#10;bravo updated"
          class="min-h-[18rem] resize-y border-border bg-background/70 font-mono text-sm leading-6"
        />
      </label>
    </div>

    <div class="rounded-lg border border-border bg-card p-4">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">新增 {{ summary.added }}</Badge>
        <Badge variant="secondary">删除 {{ summary.removed }}</Badge>
        <Badge variant="secondary">未变 {{ summary.unchanged }}</Badge>
      </div>

      <div class="min-h-[16rem] overflow-auto rounded-md border border-border bg-background/70 p-2">
        <p v-if="!hasRun" class="p-2 text-sm text-muted-foreground">点击对比文本后查看差异</p>
        <p v-else-if="rows.length === 0" class="p-2 text-sm text-muted-foreground">两侧文本都为空</p>
        <div v-else class="grid gap-1">
          <div
            v-for="(row, index) in rows"
            :key="`${index}-${row.type}-${row.value}`"
            class="grid grid-cols-[5.5rem_1.5rem_minmax(0,1fr)] gap-2 rounded-md border px-2 py-1.5 font-mono text-sm leading-6"
            :class="rowClass(row)"
          >
            <span class="text-xs tabular-nums opacity-70">{{ lineLabel(row) }}</span>
            <span class="text-center font-semibold">{{ rowMarker(row) }}</span>
            <span class="whitespace-pre-wrap break-words">{{ row.value || ' ' }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
