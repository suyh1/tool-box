<script setup lang="ts">
import { Check, Clipboard, Database, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { csvToInsertSql, type SqlDialect } from './csv-sql'
import { copyToClipboard } from '@/lib/clipboard'

const sampleCsv = 'id,name,email\n1,Ada,ada@example.com\n2,Bob,'

const input = ref('')
const output = ref('')
const tableName = ref('users')
const dialect = ref<SqlDialect>('postgres')
const delimiterMode = ref<'comma' | 'semicolon' | 'tab' | 'pipe' | 'custom'>('comma')
const customDelimiter = ref(',')
const hasHeader = ref(true)
const trimCells = ref(true)
const emptyAsNull = ref(false)
const errorMessage = ref('')
const copied = ref(false)
const meta = ref('等待 CSV')
const liveMessage = ref('')

const delimiter = computed(() => {
  if (delimiterMode.value === 'semicolon') return ';'
  if (delimiterMode.value === 'tab') return '\t'
  if (delimiterMode.value === 'pipe') return '|'
  if (delimiterMode.value === 'custom') return customDelimiter.value

  return ','
})
const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function generateSql() {
  resetFeedback()

  const result = csvToInsertSql(input.value, {
    tableName: tableName.value,
    delimiter: delimiter.value,
    hasHeader: hasHeader.value,
    trimCells: trimCells.value,
    emptyAsNull: emptyAsNull.value,
    dialect: dialect.value,
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
  input.value = sampleCsv
  output.value = ''
  tableName.value = 'users'
  meta.value = '示例已载入'
  resetFeedback()
  liveMessage.value = 'CSV SQL 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  meta.value = '等待 CSV'
  resetFeedback()
  liveMessage.value = 'CSV SQL 工作区已清空'
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
  liveMessage.value = 'SQL INSERT 已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="CSV / SQL INSERT 生成"
      description="把 CSV 或 TSV 数据转换成多行 INSERT 语句，适合快速生成本地测试数据脚本。"
      :meta="meta"
    >
      <template #icon>
        <Database class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="generateSql">
            <Database class="h-4 w-4" />
            生成 INSERT
          </Button>
        </template>

        <template #secondary>
          <label class="grid min-w-[11rem] gap-1 text-sm text-muted-foreground">
            表名
            <Input v-model="tableName" aria-label="SQL 表名" placeholder="users" />
          </label>
          <label class="flex min-w-[8rem] items-center gap-2 text-sm text-muted-foreground">
            方言
            <select
              v-model="dialect"
              class="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="SQL 方言"
            >
              <option value="postgres">Postgres</option>
              <option value="mysql">MySQL</option>
            </select>
          </label>
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
            首行为字段
          </label>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="trimCells" type="checkbox" class="h-4 w-4 accent-primary">
            裁剪空白
          </label>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="emptyAsNull" type="checkbox" class="h-4 w-4 accent-primary">
            空值为 NULL
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
        label="CSV 输入"
        ariaLabel="CSV SQL 输入"
        :placeholder="sampleCsv"
        min-height-class="min-h-[30rem]"
        empty-message="粘贴 CSV 或 TSV。首行可以作为字段名，也可以关闭表头模式生成 column_1、column_2。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="SQL 输出"
        ariaLabel="CSV SQL 输出"
        readonly
        placeholder="生成后的 INSERT 会显示在这里"
        min-height-class="min-h-[30rem]"
        empty-message="输出是纯 SQL 文本；所有值都会作为字符串转义，勾选后空字段会变成 NULL。"
      />
    </div>
  </section>
</template>
