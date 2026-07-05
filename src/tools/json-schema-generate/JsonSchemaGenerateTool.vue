<script setup lang="ts">
import { Check, Clipboard, FileJson2, RotateCcw, Sparkles, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generateJsonSchemaString } from './json-schema-generate'

const sampleJson = JSON.stringify({
  name: 'Ada',
  age: 36,
  active: true,
  tags: ['admin'],
  profile: {
    timezone: 'UTC',
  },
}, null, 2)

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)
const metaLabel = computed(() => output.value ? 'Schema 已生成' : '等待样例')

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function runGenerate() {
  resetFeedback()

  try {
    output.value = generateJsonSchemaString(input.value)
    liveMessage.value = 'JSON Schema 已生成'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON Schema 生成失败'

    errorMessage.value = message
    liveMessage.value = message
  }
}

function useSample() {
  input.value = sampleJson
  output.value = ''
  resetFeedback()
  liveMessage.value = 'JSON Schema 生成示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  liveMessage.value = 'JSON Schema 生成工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '生成的 Schema 已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="JSON Schema 生成器"
      description="从 JSON 样例推断基础 JSON Schema，包括对象字段、required、数组 items 和联合类型。"
      :meta="metaLabel"
    >
      <template #icon>
        <FileJson2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="runGenerate">
            <Sparkles class="h-4 w-4" />
            生成 Schema
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
          <Button type="button" variant="outline" :disabled="!canCopy" @click="copyOutput">
            <Check v-if="copied" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制 Schema
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
        label="JSON 样例"
        ariaLabel="JSON Schema 生成输入"
        placeholder='{"name":"Ada","tags":["admin"]}'
        min-height-class="min-h-[28rem]"
        empty-message="粘贴一个 JSON 样例。数组会合并多个项目的结构。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="生成的 JSON Schema"
        ariaLabel="JSON Schema 生成输出"
        readonly
        placeholder="生成后显示 Schema"
        min-height-class="min-h-[28rem]"
        empty-message="Schema 会使用 draft 2020-12，并尽量保留样例中的结构。"
      />
    </div>
  </section>
</template>
