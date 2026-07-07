<script setup lang="ts">
import { Check, Clipboard, RotateCcw, Table2, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { parseCsvTable, tableToTsv, type CsvTable } from './csv-table'
import { copyToClipboard } from '@/lib/clipboard'

const sampleCsv = [
  'name,role,note',
  'Ada,admin,"ships, fast"',
  'Bob,editor,',
  'Lin,analyst,"multi',
  'line"',
].join('\n')

const delimiterMode = ref<'comma' | 'semicolon' | 'tab' | 'pipe' | 'custom'>('comma')
const customDelimiter = ref(',')
const input = ref('')
const table = ref<CsvTable | null>(null)
const hasHeader = ref(true)
const trimCells = ref(false)
const skipEmptyRows = ref(true)
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')

const delimiter = computed(() => {
  if (delimiterMode.value === 'semicolon') return ';'
  if (delimiterMode.value === 'tab') return '\t'
  if (delimiterMode.value === 'pipe') return '|'
  if (delimiterMode.value === 'custom') return customDelimiter.value

  return ','
})
const hasTable = computed(() => Boolean(table.value && table.value.columns.length > 0))
const canCopy = computed(() => Boolean(table.value && table.value.columns.length > 0))
const metaLabel = computed(() => table.value
  ? `${table.value.rowCount} 行 / ${table.value.columnCount} 列`
  : '等待 CSV')

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function previewTable() {
  resetFeedback()

  try {
    table.value = parseCsvTable(input.value, {
      delimiter: delimiter.value,
      hasHeader: hasHeader.value,
      trimCells: trimCells.value,
      skipEmptyRows: skipEmptyRows.value,
    })
    liveMessage.value = table.value.rowCount > 0
      ? `已解析 ${table.value.rowCount} 行 CSV`
      : 'CSV 中没有可显示的数据'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CSV 解析失败'

    table.value = null
    errorMessage.value = message
    liveMessage.value = message
  }
}

function useSample() {
  input.value = sampleCsv
  table.value = null
  resetFeedback()
  liveMessage.value = 'CSV 表格示例已载入'
}

function clearAll() {
  input.value = ''
  table.value = null
  resetFeedback()
  liveMessage.value = 'CSV 表格工作区已清空'
}

async function copyTable() {
  if (!table.value || !canCopy.value) {
    return
  }

  const clipboardResult = await copyToClipboard(tableToTsv(table.value))
  if (!clipboardResult.ok) {
    liveMessage.value = clipboardResult.message
    return
  }
  copied.value = true
  liveMessage.value = '表格已按 TSV 复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="CSV 表格查看器"
      description="解析 CSV、TSV 或自定义分隔符文本，快速检查表头、空字段和列数不一致的问题。"
      :meta="metaLabel"
    >
      <template #icon>
        <Table2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="previewTable">
            <Table2 class="h-4 w-4" />
            解析表格
          </Button>
        </template>

        <template #secondary>
          <label class="flex min-w-[10rem] items-center gap-2 text-sm text-muted-foreground">
            分隔符
            <select
              v-model="delimiterMode"
              class="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="CSV 分隔符"
            >
              <option value="comma">逗号</option>
              <option value="semicolon">分号</option>
              <option value="tab">Tab</option>
              <option value="pipe">竖线</option>
              <option value="custom">自定义</option>
            </select>
          </label>
          <Input
            v-if="delimiterMode === 'custom'"
            v-model="customDelimiter"
            aria-label="自定义分隔符"
            maxlength="1"
            class="w-20"
          />
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="hasHeader" type="checkbox" class="h-4 w-4 accent-primary">
            首行为表头
          </label>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="trimCells" type="checkbox" class="h-4 w-4 accent-primary">
            裁剪空白
          </label>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="skipEmptyRows" type="checkbox" class="h-4 w-4 accent-primary">
            忽略空行
          </label>
          <Button type="button" variant="ghost" @click="useSample">
            <RotateCcw class="h-4 w-4" />
            示例
          </Button>
          <Button type="button" variant="ghost" @click="clearAll">
            <Trash2 class="h-4 w-4" />
            清空
          </Button>
          <Button type="button" variant="outline" :disabled="!canCopy" @click="copyTable">
            <Check v-if="copied" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制 TSV
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
      <ul
        v-if="table?.warnings.length"
        class="mt-3 grid gap-2 rounded-md border border-primary/35 bg-primary/10 px-3 py-2 text-sm text-primary"
      >
        <li v-for="warning in table.warnings" :key="warning">{{ warning }}</li>
      </ul>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(24rem,1.15fr)]">
      <ToolTextareaPanel
        v-model="input"
        label="CSV 输入"
        ariaLabel="CSV 表格输入"
        placeholder="name,role&#10;Ada,admin"
        min-height-class="min-h-[30rem]"
        empty-message="粘贴 CSV、TSV 或其他单字符分隔符数据。解析后右侧会显示可横向滚动的表格。"
      />

      <section class="tool-field grid gap-3 rounded-lg border border-border bg-card p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-sm font-medium text-foreground">表格预览</h3>
            <p class="mt-1 text-xs leading-5 text-muted-foreground">
              {{ table ? `${table.rowCount} 行数据，${table.columnCount} 列` : '解析后查看表格。' }}
            </p>
          </div>
        </div>

        <div
          v-if="hasTable && table"
          class="max-h-[32rem] overflow-auto rounded-md border border-border bg-background/55"
        >
          <table class="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead class="sticky top-0 z-10 bg-muted text-muted-foreground">
              <tr>
                <th class="w-14 border-b border-border px-3 py-2 font-mono text-xs">#</th>
                <th
                  v-for="column in table.columns"
                  :key="column"
                  class="min-w-36 border-b border-l border-border px-3 py-2 font-medium"
                >
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in table.rows" :key="rowIndex" class="odd:bg-background/40">
                <td class="border-b border-border px-3 py-2 font-mono text-xs text-muted-foreground">
                  {{ rowIndex + 1 }}
                </td>
                <td
                  v-for="(cell, cellIndex) in row"
                  :key="`${rowIndex}-${cellIndex}`"
                  class="max-w-72 whitespace-pre-wrap break-words border-b border-l border-border px-3 py-2 font-mono text-xs leading-5 text-foreground"
                >
                  <span v-if="cell">{{ cell }}</span>
                  <span v-else class="text-muted-foreground/65">空</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p
          v-else
          class="grid min-h-[30rem] place-items-center rounded-md border border-dashed border-border bg-background/35 px-4 text-center text-sm text-muted-foreground"
        >
          粘贴数据并点击解析表格。
        </p>
      </section>
    </div>
  </section>
</template>
