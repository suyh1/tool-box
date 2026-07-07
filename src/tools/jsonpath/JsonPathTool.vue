<script setup lang="ts">
import { Check, Clipboard, ListTree, Play, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { queryJsonPath, type JsonPathMatch } from './jsonpath'
import { copyToClipboard } from '@/lib/clipboard'

const sampleJson = JSON.stringify({
  store: {
    books: [
      { title: 'Clean Code', price: 30 },
      { title: 'Domain Modeling', price: 42 },
    ],
    'featured-item': { title: 'Refactoring' },
  },
}, null, 2)

const input = ref('')
const expression = ref('$.store.books[*].title')
const output = ref('')
const matches = ref<JsonPathMatch[]>([])
const errorMessage = ref('')
const copiedOutput = ref(false)
const copiedPath = ref('')
const liveMessage = ref('')

const canCopyOutput = computed(() => output.value.length > 0)
const resultLabel = computed(() => matches.value.length > 0 ? `${matches.value.length} 个匹配` : '等待查询')

function resetFeedback() {
  errorMessage.value = ''
  copiedOutput.value = false
  copiedPath.value = ''
}

function runQuery() {
  resetFeedback()

  try {
    const result = queryJsonPath(input.value, expression.value)

    matches.value = result.matches
    output.value = result.output
    liveMessage.value = result.matches.length > 0
      ? `找到 ${result.matches.length} 个匹配`
      : '没有匹配结果'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSONPath 查询失败'

    errorMessage.value = message
    liveMessage.value = message
  }
}

function useSample() {
  input.value = sampleJson
  expression.value = '$.store.books[*].title'
  output.value = ''
  matches.value = []
  resetFeedback()
  liveMessage.value = 'JSONPath 示例已载入'
}

function clearAll() {
  input.value = ''
  expression.value = '$'
  output.value = ''
  matches.value = []
  resetFeedback()
  liveMessage.value = 'JSONPath 工作区已清空'
}

async function copyOutput() {
  if (!canCopyOutput.value) {
    return
  }

  const clipboardResult = await copyToClipboard(output.value)
  if (!clipboardResult.ok) {
    liveMessage.value = clipboardResult.message
    return
  }
  copiedOutput.value = true
  copiedPath.value = ''
  liveMessage.value = 'JSONPath 输出已复制'
}

async function copyPath(match: JsonPathMatch) {
  const clipboardResult = await copyToClipboard(match.path)
  if (!clipboardResult.ok) {
    liveMessage.value = clipboardResult.message
    return
  }
  copiedPath.value = match.path
  copiedOutput.value = false
  liveMessage.value = `${match.path} 已复制`
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="JSONPath 查询器"
      description="用常见 JSONPath 语法查询 JSON，支持属性、括号键、数组索引和通配符。"
      :meta="resultLabel"
    >
      <template #icon>
        <ListTree class="h-4 w-4 text-primary" />
      </template>

      <label class="mt-4 grid gap-2">
        <span class="text-sm font-medium text-foreground">JSONPath</span>
        <Input
          v-model="expression"
          aria-label="JSONPath 表达式"
          placeholder="$.store.books[*].title"
          class="h-9 font-mono"
          @keyup.enter="runQuery"
        />
      </label>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input || !expression" @click="runQuery">
            <Play class="h-4 w-4" />
            查询
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
          <Button type="button" variant="outline" :disabled="!canCopyOutput" @click="copyOutput">
            <Check v-if="copiedOutput" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制结果
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
        label="JSON 输入"
        ariaLabel="JSONPath JSON 输入"
        placeholder='{"store":{"books":[{"title":"Clean Code"}]}}'
        min-height-class="min-h-[24rem]"
        empty-message="粘贴 JSON 后输入 JSONPath 表达式。支持 $.a.b、$['a-b']、[0]、[*]。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="匹配值"
        ariaLabel="JSONPath 查询输出"
        readonly
        placeholder="查询后显示匹配值数组"
        min-height-class="min-h-[24rem]"
        empty-message="匹配值会以 JSON 数组输出，便于继续复制到其他工具。"
      />
    </div>

    <section class="tool-field grid gap-3 rounded-lg border border-border bg-card p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-sm font-medium text-foreground">匹配路径</h3>
          <p class="mt-1 text-xs leading-5 text-muted-foreground">逐项复制命中的 JSONPath，方便定位字段。</p>
        </div>
        <Badge variant="secondary">{{ matches.length }} 条</Badge>
      </div>

      <div class="min-h-[10rem] overflow-auto rounded-md border border-border bg-background/70 p-2">
        <p v-if="matches.length === 0" class="px-2 py-3 text-sm leading-6 text-muted-foreground">
          查询后这里会列出命中路径。
        </p>
        <div v-else class="grid gap-1">
          <div
            v-for="match in matches"
            :key="match.path"
            class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/55"
          >
            <code class="break-all font-mono text-sm text-foreground">{{ match.path }}</code>
            <Button
              type="button"
              variant="outline"
              size="icon"
              class="h-8 w-8 shrink-0"
              :aria-label="`复制路径 ${match.path}`"
              @click="copyPath(match)"
            >
              <Check v-if="copiedPath === match.path" class="h-4 w-4" />
              <Clipboard v-else class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>
