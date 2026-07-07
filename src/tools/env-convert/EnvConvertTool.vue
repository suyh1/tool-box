<script setup lang="ts">
import { Check, Clipboard, FileCog, RotateCcw, Sparkles, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { envToJson, jsonToEnv, parseEnv } from './env-convert'
import { copyToClipboard } from '@/lib/clipboard'

const sampleEnv = `APP_NAME=Toolbox
PORT=5173
DEBUG=true
API_KEY="local secret"`
const sampleJson = JSON.stringify({
  APP_NAME: 'Toolbox',
  PORT: 5173,
  DEBUG: true,
  API_KEY: 'local secret',
}, null, 2)

const input = ref(sampleEnv)
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const lastMode = ref<'env-json' | 'json-env' | null>(null)

const canCopy = computed(() => output.value.length > 0)
const meta = computed(() => {
  if (lastMode.value === 'env-json') return 'ENV -> JSON'
  if (lastMode.value === 'json-env') return 'JSON -> ENV'
  return 'Config'
})

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function convertEnvToJson() {
  resetFeedback()

  try {
    const result = parseEnv(input.value)
    output.value = envToJson(input.value)
    lastMode.value = 'env-json'
    liveMessage.value = `.env 已转换为 JSON，${result.entries.length} 个变量`
  } catch (error) {
    output.value = ''
    errorMessage.value = error instanceof Error ? error.message : '.env 解析失败'
    liveMessage.value = errorMessage.value
  }
}

function convertJsonToEnv() {
  resetFeedback()

  try {
    output.value = jsonToEnv(input.value)
    lastMode.value = 'json-env'
    liveMessage.value = 'JSON 已转换为 .env'
  } catch (error) {
    output.value = ''
    errorMessage.value = error instanceof Error ? error.message : 'JSON 转换失败'
    liveMessage.value = errorMessage.value
  }
}

function useEnvSample() {
  input.value = sampleEnv
  output.value = ''
  lastMode.value = null
  resetFeedback()
  liveMessage.value = '.env 示例已载入'
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
  liveMessage.value = '.env 工作区已清空'
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
  liveMessage.value = '配置转换结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title=".env 解析 / JSON 转换" description="解析 .env 键值配置，并在 .env 与扁平 JSON 对象之间转换。" :meta="meta">
      <template #icon>
        <FileCog class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="convertEnvToJson">
            <Sparkles class="h-4 w-4" />
            .env 转 JSON
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input" @click="convertJsonToEnv">
            JSON 转 .env
          </Button>
          <Button type="button" variant="ghost" @click="useEnvSample">
            <RotateCcw class="h-4 w-4" />
            .env 示例
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

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="input" label="输入" ariaLabel=".env 或 JSON 输入" placeholder="APP_NAME=Toolbox" min-height-class="min-h-[28rem]" empty-message="粘贴 .env 或扁平 JSON 对象。" />
      <ToolTextareaPanel v-model="output" label="输出" ariaLabel=".env 或 JSON 输出" readonly placeholder="执行转换后查看输出" min-height-class="min-h-[28rem]" empty-message="转换后的配置会显示在这里。" />
    </div>
  </section>
</template>
