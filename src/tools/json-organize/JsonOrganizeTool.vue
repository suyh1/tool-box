<script setup lang="ts">
import {
  ArrowDownAZ,
  Braces,
  Check,
  Clipboard,
  ListTree,
  RotateCcw,
  Rows3,
  Sparkles,
  Trash2,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import {
  getJsonPathEntries,
  organizeJson,
  type JsonOrganizeOptions,
  type JsonOrganizeStats,
  type JsonPathEntry,
} from './json-organize'

const sampleJson = JSON.stringify({
  zeta: 'last',
  user: {
    name: 'Ada',
    active: true,
    roles: ['admin', 'admin', 'editor'],
  },
  items: [
    { id: 2, name: 'second' },
    { name: 'first', id: 1 },
    { id: 2, name: 'second' },
  ],
}, null, 2)

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const pathEntries = ref<JsonPathEntry[]>([])
const lastStats = ref<JsonOrganizeStats | null>(null)
const copiedOutput = ref(false)
const copiedPath = ref('')
const liveMessage = ref('')

const canCopyOutput = computed(() => output.value.length > 0)
const hasPaths = computed(() => pathEntries.value.length > 0)
const pathSource = computed(() => output.value || input.value)
const metaLabel = computed(() => {
  if (lastStats.value) {
    const removed = lastStats.value.removedItemCount
    return removed > 0 ? `已移除 ${removed} 项` : '结构已整理'
  }

  return hasPaths.value ? `${pathEntries.value.length} 条路径` : '等待 JSON'
})

const kindLabels: Record<JsonPathEntry['kind'], string> = {
  array: '数组',
  object: '对象',
  string: '字符串',
  number: '数字',
  boolean: '布尔',
  null: 'null',
}

function resetFeedback() {
  errorMessage.value = ''
  copiedOutput.value = false
  copiedPath.value = ''
}

function setError(error: unknown) {
  const message = error instanceof Error ? error.message : 'JSON 处理失败'

  errorMessage.value = message
  liveMessage.value = message
}

function refreshPaths(source = pathSource.value) {
  pathEntries.value = getJsonPathEntries(source)
}

function runOrganize(options: JsonOrganizeOptions, message: string) {
  resetFeedback()

  try {
    const result = organizeJson(input.value, options)

    output.value = result.output
    lastStats.value = result.stats
    refreshPaths(result.output)
    liveMessage.value = message
  } catch (error) {
    setError(error)
  }
}

function runPathList() {
  resetFeedback()

  try {
    refreshPaths()
    lastStats.value = null
    liveMessage.value = pathEntries.value.length > 0
      ? `已生成 ${pathEntries.value.length} 条 JSON 路径`
      : '根节点没有可展开路径'
  } catch (error) {
    setError(error)
  }
}

function useSample() {
  input.value = sampleJson
  output.value = ''
  errorMessage.value = ''
  pathEntries.value = []
  lastStats.value = null
  copiedOutput.value = false
  copiedPath.value = ''
  liveMessage.value = 'JSON 整理示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  pathEntries.value = []
  lastStats.value = null
  copiedOutput.value = false
  copiedPath.value = ''
  liveMessage.value = 'JSON 整理工作区已清空'
}

async function copyOutput() {
  if (!canCopyOutput.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copiedOutput.value = true
  copiedPath.value = ''
  liveMessage.value = 'JSON 输出已复制'
}

async function copyPath(entry: JsonPathEntry) {
  await navigator.clipboard.writeText(entry.path)
  copiedPath.value = entry.path
  copiedOutput.value = false
  liveMessage.value = `${entry.path} 已复制`
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="JSON 排序 / 去重"
      description="递归排序对象键、移除数组重复项，并生成可逐项复制的 JSONPath 路径。所有内容只在浏览器中处理。"
      :meta="metaLabel"
    >
      <template #icon>
        <Braces class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="runOrganize({ sortKeys: true, dedupeArrays: true }, 'JSON 已排序并去重')">
            <Sparkles class="h-4 w-4" />
            整理 JSON
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input" @click="runOrganize({ sortKeys: true }, 'JSON 键已排序')">
            <ArrowDownAZ class="h-4 w-4" />
            仅排序键
          </Button>
          <Button type="button" variant="secondary" :disabled="!input" @click="runOrganize({ dedupeArrays: true }, 'JSON 数组已去重')">
            <Rows3 class="h-4 w-4" />
            数组去重
          </Button>
          <Button type="button" variant="outline" :disabled="!pathSource" @click="runPathList">
            <ListTree class="h-4 w-4" />
            生成路径
          </Button>
          <Button type="button" variant="ghost" @click="useSample">
            <RotateCcw class="h-4 w-4" />
            示例
          </Button>
          <Button type="button" variant="ghost" @click="clearAll">
            <Trash2 class="h-4 w-4" />
            清空
          </Button>
          <Button type="button" variant="outline" :disabled="!canCopyOutput" @click="copyOutput">
            <Check v-if="copiedOutput" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制输出
          </Button>
        </template>
      </ToolActionBar>

      <dl
        v-if="lastStats"
        class="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3"
      >
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">排序对象</dt>
          <dd class="mt-1 font-mono text-foreground">{{ lastStats.sortedObjectCount }}</dd>
        </div>
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">去重数组</dt>
          <dd class="mt-1 font-mono text-foreground">{{ lastStats.dedupedArrayCount }}</dd>
        </div>
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">移除项目</dt>
          <dd class="mt-1 font-mono text-foreground">{{ lastStats.removedItemCount }}</dd>
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

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel
        v-model="input"
        label="输入"
        ariaLabel="JSON 排序去重输入"
        placeholder='{"z":1,"a":{"b":2}}'
        min-height-class="min-h-[24rem]"
        empty-message="粘贴对象、数组或任意有效 JSON。可以排序键、去重数组，或直接生成路径清单。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="JSON 排序去重输出"
        readonly
        placeholder="执行整理操作后查看输出"
        min-height-class="min-h-[24rem]"
        empty-message="排序和去重结果会保留格式化缩进，方便继续复制或审阅。"
      />
    </div>

    <section class="tool-field grid gap-3 rounded-lg border border-border bg-card p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-sm font-medium text-foreground">路径清单</h3>
          <p class="mt-1 text-xs leading-5 text-muted-foreground">
            复制字段路径用于调试、文档或后续 JSONPath 查询。
          </p>
        </div>
        <Badge variant="secondary">{{ pathEntries.length }} 条</Badge>
      </div>

      <div class="min-h-[12rem] overflow-auto rounded-md border border-border bg-background/70 p-2">
        <p v-if="!hasPaths" class="px-2 py-3 text-sm leading-6 text-muted-foreground">
          点击“生成路径”或整理 JSON 后，这里会列出对象键和数组项路径。
        </p>

        <div v-else class="grid gap-1">
          <div
            v-for="entry in pathEntries"
            :key="entry.path"
            class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/55"
          >
            <div
              class="min-w-0"
              :style="{ paddingLeft: `${Math.min(entry.depth - 1, 8) * 0.75}rem` }"
            >
              <div class="flex flex-wrap items-center gap-2">
                <code class="break-all font-mono text-sm text-foreground">{{ entry.path }}</code>
                <Badge variant="outline">{{ kindLabels[entry.kind] }}</Badge>
              </div>
              <p class="mt-1 truncate font-mono text-xs text-muted-foreground">{{ entry.preview }}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              class="h-8 w-8 shrink-0"
              :aria-label="`复制路径 ${entry.path}`"
              @click="copyPath(entry)"
            >
              <Check v-if="copiedPath === entry.path" class="h-4 w-4" />
              <Clipboard v-else class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>
