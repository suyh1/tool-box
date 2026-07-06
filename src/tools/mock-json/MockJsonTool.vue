<script setup lang="ts">
import { Check, Clipboard, FileJson, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generateMockJson, type MockJsonMode } from './mock-json'

const schemaSample = `{
  "id": "uuid",
  "name": "name",
  "email": "email",
  "active": "boolean",
  "score": "number",
  "tags": ["word"]
}`

const input = ref(schemaSample)
const output = ref('')
const mode = ref<MockJsonMode>('schema')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('schema')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function generateJson() {
  resetFeedback()
  const result = generateMockJson(input.value, { mode: mode.value })

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.json
  meta.value = result.mode
  liveMessage.value = 'Mock JSON 已生成'
}

function useSample() {
  mode.value = 'schema'
  input.value = schemaSample
  output.value = ''
  resetFeedback()
  meta.value = 'schema'
  liveMessage.value = 'Mock JSON 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = mode.value
  liveMessage.value = 'Mock JSON 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'Mock JSON 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Mock JSON 数据生成" description="按紧凑 schema 或样例形状生成本地 mock JSON。" :meta="meta">
      <template #icon>
        <FileJson class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="generateJson">
            生成 JSON
          </Button>
        </template>

        <template #secondary>
          <select
            v-model="mode"
            aria-label="Mock JSON 模式"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value="schema">Schema token</option>
            <option value="sample">Sample shape</option>
          </select>
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
        label="输入"
        ariaLabel="Mock JSON 输入"
        placeholder="{ &quot;id&quot;: &quot;uuid&quot; }"
        min-height-class="min-h-[28rem]"
        empty-message="输入 schema token 或样例 JSON。"
      />
      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="Mock JSON 输出"
        readonly
        placeholder="点击生成 JSON"
        min-height-class="min-h-[28rem]"
        empty-message="生成的 mock JSON 会显示在这里。"
      />
    </div>
  </section>
</template>
