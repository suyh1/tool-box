<script setup lang="ts">
import { Check, Clipboard, FileCog, RotateCcw, Sparkles, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { formatToml, jsonToToml, tomlToJsonString } from './toml'

const sampleToml = 'title="Toolbox"\n[server]\nport=5173\nenabled=true'
const sampleJson = JSON.stringify({
  title: 'Toolbox',
  server: {
    port: 5173,
    enabled: true,
  },
}, null, 2)

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const lastMode = ref<'format' | 'toml-json' | 'json-toml' | null>(null)

const canCopy = computed(() => output.value.length > 0)
const metaLabel = computed(() => {
  if (lastMode.value === 'toml-json') return 'TOML → JSON'
  if (lastMode.value === 'json-toml') return 'JSON → TOML'
  if (lastMode.value === 'format') return 'TOML 已格式化'
  return '等待输入'
})

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function runAction(mode: 'format' | 'toml-json' | 'json-toml') {
  resetFeedback()

  try {
    output.value = mode === 'format'
      ? formatToml(input.value)
      : mode === 'toml-json'
        ? tomlToJsonString(input.value)
        : jsonToToml(input.value)
    lastMode.value = mode
    liveMessage.value = metaLabel.value
  } catch (error) {
    const message = error instanceof Error ? error.message : 'TOML 处理失败'

    errorMessage.value = message
    liveMessage.value = message
  }
}

function useTomlSample() {
  input.value = sampleToml
  output.value = ''
  lastMode.value = null
  resetFeedback()
  liveMessage.value = 'TOML 示例已载入'
}

function useJsonSample() {
  input.value = sampleJson
  output.value = ''
  lastMode.value = null
  resetFeedback()
  liveMessage.value = 'JSON 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  lastMode.value = null
  resetFeedback()
  liveMessage.value = 'TOML 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'TOML 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="TOML 格式化 / JSON 转换"
      description="格式化基础 TOML，并在 TOML 与 JSON 配置表示之间转换。"
      :meta="metaLabel"
    >
      <template #icon>
        <FileCog class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="runAction('format')">
            <Sparkles class="h-4 w-4" />
            格式化 TOML
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input" @click="runAction('toml-json')">
            TOML 转 JSON
          </Button>
          <Button type="button" variant="secondary" :disabled="!input" @click="runAction('json-toml')">
            JSON 转 TOML
          </Button>
          <Button type="button" variant="ghost" @click="useTomlSample">
            <RotateCcw class="h-4 w-4" />
            TOML 示例
          </Button>
          <Button type="button" variant="ghost" @click="useJsonSample">
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
        ariaLabel="TOML 输入"
        placeholder="title = &quot;Toolbox&quot;"
        min-height-class="min-h-[28rem]"
        empty-message="粘贴 TOML 或 JSON。当前支持常见 section、字符串、数字、布尔值和基础数组。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="TOML 输出"
        readonly
        placeholder="执行 TOML 操作后查看输出"
        min-height-class="min-h-[28rem]"
        empty-message="转换结果会显示在这里。"
      />
    </div>
  </section>
</template>
