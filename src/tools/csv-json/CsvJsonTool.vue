<script setup lang="ts">
import { Check, Clipboard, RotateCcw, Table2, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { csvToJsonString, jsonToCsv } from './csv-json'

const sampleCsv = 'name,role,note\nAda,admin,"ships, fast"\nBob,editor,'
const sampleJson = JSON.stringify([
  { name: 'Ada', note: 'ships, fast' },
  { name: 'Bob', note: 'He said "hi"' },
], null, 2)

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const lastMode = ref<'csv-json' | 'json-csv' | null>(null)

const canCopy = computed(() => output.value.length > 0)
const metaLabel = computed(() => lastMode.value === 'csv-json'
  ? 'CSV → JSON'
  : lastMode.value === 'json-csv'
    ? 'JSON → CSV'
    : '等待转换')

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function convertToJson() {
  resetFeedback()

  try {
    output.value = csvToJsonString(input.value)
    lastMode.value = 'csv-json'
    liveMessage.value = 'CSV 已转换为 JSON'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CSV 转 JSON 失败'

    errorMessage.value = message
    liveMessage.value = message
  }
}

function convertToCsv() {
  resetFeedback()

  try {
    output.value = jsonToCsv(input.value)
    lastMode.value = 'json-csv'
    liveMessage.value = 'JSON 已转换为 CSV'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON 转 CSV 失败'

    errorMessage.value = message
    liveMessage.value = message
  }
}

function useSample(value: string, message: string) {
  input.value = value
  output.value = ''
  lastMode.value = null
  resetFeedback()
  liveMessage.value = message
}

function clearAll() {
  input.value = ''
  output.value = ''
  lastMode.value = null
  resetFeedback()
  liveMessage.value = 'CSV / JSON 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'CSV / JSON 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="CSV / JSON 转换"
      description="在 CSV 表格文本和 JSON 对象数组之间转换，支持引号、逗号和空字段。"
      :meta="metaLabel"
    >
      <template #icon>
        <Table2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="convertToJson">
            CSV 转 JSON
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input" @click="convertToCsv">
            JSON 转 CSV
          </Button>
          <Button type="button" variant="ghost" @click="useSample(sampleCsv, 'CSV 示例已载入')">
            <RotateCcw class="h-4 w-4" />
            CSV 示例
          </Button>
          <Button type="button" variant="ghost" @click="useSample(sampleJson, 'JSON 示例已载入')">
            <RotateCcw class="h-4 w-4" />
            JSON 示例
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
        label="输入"
        ariaLabel="CSV JSON 输入"
        placeholder="name,role&#10;Ada,admin"
        min-height-class="min-h-[28rem]"
        empty-message="粘贴 CSV 或 JSON 对象数组。第一行 CSV 会作为字段名。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="CSV JSON 输出"
        readonly
        placeholder="转换后查看输出"
        min-height-class="min-h-[28rem]"
        empty-message="转换结果会显示在这里。"
      />
    </div>
  </section>
</template>
