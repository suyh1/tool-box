<script setup lang="ts">
import { Check, Clipboard, FileCog, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { configToJsonString, iniToJson, jsonToProperties, propertiesToJson } from './ini-properties'

const sampleIni = '[server]\nport=5173\nenabled=true\n\n[app]\nname=Toolbox'
const sampleProperties = 'server.port=5173\nserver.enabled=true\napp.name=Toolbox'
const sampleJson = JSON.stringify({
  server: {
    port: '5173',
    enabled: 'true',
  },
  app: {
    name: 'Toolbox',
  },
}, null, 2)

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const lastMode = ref<'ini-json' | 'properties-json' | 'json-properties' | null>(null)

const canCopy = computed(() => output.value.length > 0)
const metaLabel = computed(() => {
  if (lastMode.value === 'ini-json') return 'INI → JSON'
  if (lastMode.value === 'properties-json') return 'Properties → JSON'
  if (lastMode.value === 'json-properties') return 'JSON → Properties'
  return '等待输入'
})

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function runAction(mode: 'ini-json' | 'properties-json' | 'json-properties') {
  resetFeedback()

  try {
    output.value = mode === 'ini-json'
      ? configToJsonString(iniToJson(input.value))
      : mode === 'properties-json'
        ? configToJsonString(propertiesToJson(input.value))
        : jsonToProperties(input.value)
    lastMode.value = mode
    liveMessage.value = metaLabel.value
  } catch (error) {
    const message = error instanceof Error ? error.message : 'INI / Properties 处理失败'

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
  liveMessage.value = 'INI / Properties 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'INI / Properties 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="INI / Properties 转换"
      description="将 INI section 或 Java properties 转成 JSON，也可将 JSON 展平为 properties。"
      :meta="metaLabel"
    >
      <template #icon>
        <FileCog class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="runAction('ini-json')">
            INI 转 JSON
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input" @click="runAction('properties-json')">
            Properties 转 JSON
          </Button>
          <Button type="button" variant="secondary" :disabled="!input" @click="runAction('json-properties')">
            JSON 转 Properties
          </Button>
          <Button type="button" variant="ghost" @click="useSample(sampleIni, 'INI 示例已载入')">
            <RotateCcw class="h-4 w-4" />
            INI 示例
          </Button>
          <Button type="button" variant="ghost" @click="useSample(sampleProperties, 'Properties 示例已载入')">
            <RotateCcw class="h-4 w-4" />
            Properties 示例
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
        ariaLabel="INI Properties 输入"
        placeholder="[server]&#10;port=5173"
        min-height-class="min-h-[28rem]"
        empty-message="粘贴 INI、properties 或 JSON。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="INI Properties 输出"
        readonly
        placeholder="转换后查看输出"
        min-height-class="min-h-[28rem]"
        empty-message="转换结果会显示在这里。"
      />
    </div>
  </section>
</template>
