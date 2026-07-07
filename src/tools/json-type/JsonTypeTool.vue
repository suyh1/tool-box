<script setup lang="ts">
import { Check, Clipboard, Code2, RotateCcw, Sparkles, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { convertJsonToType, type JsonTypeTarget } from './json-type'
import { copyToClipboard } from '@/lib/clipboard'

const sampleJson = JSON.stringify([
  {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    roles: ['admin', 'developer'],
    profile: {
      avatar_url: 'https://example.com/avatar.png',
      score: 98.5,
    },
  },
  {
    id: 2,
    name: 'Lin Chen',
    email: null,
    roles: ['developer'],
  },
], null, 2)

const targets: Array<{ value: JsonTypeTarget; label: string }> = [
  { value: 'typescript', label: 'TypeScript interface' },
  { value: 'java', label: 'Java class' },
  { value: 'go', label: 'Go struct' },
  { value: 'zod', label: 'Zod schema' },
]

const input = ref('')
const output = ref('')
const rootName = ref('Root')
const target = ref<JsonTypeTarget>('typescript')
const errorMessage = ref('')
const meta = ref('等待 JSON')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)

function generateTypes() {
  errorMessage.value = ''
  copied.value = false

  try {
    const result = convertJsonToType(input.value, target.value, rootName.value)

    if (!result.ok) {
      errorMessage.value = result.message
      liveMessage.value = result.message
      return
    }

    output.value = result.value
    meta.value = result.meta
    liveMessage.value = result.meta
  } catch {
    errorMessage.value = '类型生成失败，请检查 JSON 内容。'
    liveMessage.value = errorMessage.value
  }
}

function useSample() {
  input.value = sampleJson
  output.value = ''
  rootName.value = 'User'
  target.value = 'typescript'
  errorMessage.value = ''
  meta.value = '示例已载入'
  copied.value = false
  liveMessage.value = 'JSON 类型示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  rootName.value = 'Root'
  target.value = 'typescript'
  errorMessage.value = ''
  meta.value = '等待 JSON'
  copied.value = false
  liveMessage.value = 'JSON 类型工作区已清空'
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
  liveMessage.value = '类型输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="JSON 转类型"
      description="从 JSON 对象或对象数组生成 TypeScript、Java、Go 和 Zod 类型，推导过程只在浏览器中完成。"
      :meta="meta"
    >
      <template #icon>
        <Code2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="generateTypes">
            <Sparkles class="h-4 w-4" />
            生成类型
          </Button>
        </template>

        <template #secondary>
          <label class="sr-only" for="json-type-root">根类型名</label>
          <input
            id="json-type-root"
            v-model="rootName"
            type="text"
            aria-label="根类型名"
            class="h-9 w-32 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="Root"
          >
          <label class="sr-only" for="json-type-target">目标类型</label>
          <select
            id="json-type-target"
            v-model="target"
            aria-label="目标类型"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in targets" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
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
        label="JSON 输入"
        ariaLabel="JSON 类型输入"
        placeholder='{"id":1,"name":"Ada"}'
        min-height-class="min-h-[24rem]"
        empty-message="粘贴 JSON 对象或对象数组。字段类型会从样例值推导，不会上传内容。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="类型输出"
        ariaLabel="JSON 类型输出"
        readonly
        placeholder="点击生成类型后查看输出"
        min-height-class="min-h-[24rem]"
        empty-message="生成的 TypeScript、Java、Go 或 Zod 代码会显示在这里。"
      />
    </div>
  </section>
</template>
