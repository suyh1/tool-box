<script setup lang="ts">
import { ArrowLeftRight, Check, Clipboard, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { jsonToXml, xmlToJsonString } from './xml-json'
import { copyToClipboard } from '@/lib/clipboard'

const sampleXml = '<user id="1"><name>Ada</name><role>admin</role><role>editor</role></user>'
const sampleJson = JSON.stringify({
  user: {
    '@id': '1',
    name: 'Ada',
    role: ['admin', 'editor'],
  },
}, null, 2)

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const lastMode = ref<'xml-json' | 'json-xml' | null>(null)

const canCopy = computed(() => output.value.length > 0)
const metaLabel = computed(() => lastMode.value === 'xml-json'
  ? 'XML → JSON'
  : lastMode.value === 'json-xml'
    ? 'JSON → XML'
    : '等待转换')

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function convertToJson() {
  resetFeedback()

  try {
    output.value = xmlToJsonString(input.value)
    lastMode.value = 'xml-json'
    liveMessage.value = 'XML 已转换为 JSON'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'XML 转 JSON 失败'

    errorMessage.value = message
    liveMessage.value = message
  }
}

function convertToXml() {
  resetFeedback()

  try {
    output.value = jsonToXml(input.value)
    lastMode.value = 'json-xml'
    liveMessage.value = 'JSON 已转换为 XML'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON 转 XML 失败'

    errorMessage.value = message
    liveMessage.value = message
  }
}

function useXmlSample() {
  input.value = sampleXml
  output.value = ''
  lastMode.value = null
  resetFeedback()
  liveMessage.value = 'XML 转 JSON 示例已载入'
}

function useJsonSample() {
  input.value = sampleJson
  output.value = ''
  lastMode.value = null
  resetFeedback()
  liveMessage.value = 'JSON 转 XML 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  lastMode.value = null
  resetFeedback()
  liveMessage.value = 'XML / JSON 转换工作区已清空'
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
  liveMessage.value = '转换输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="XML / JSON 转换"
      description="在 XML 和 JSON 之间转换，属性使用 @ 前缀，文本节点使用 #text。"
      :meta="metaLabel"
    >
      <template #icon>
        <ArrowLeftRight class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="convertToJson">
            XML 转 JSON
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input" @click="convertToXml">
            JSON 转 XML
          </Button>
          <Button type="button" variant="ghost" @click="useXmlSample">
            <RotateCcw class="h-4 w-4" />
            XML 示例
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
        ariaLabel="XML JSON 转换输入"
        placeholder="<user id=&quot;1&quot;><name>Ada</name></user>"
        min-height-class="min-h-[28rem]"
        empty-message="粘贴 XML 或符合工具约定的 JSON。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="XML JSON 转换输出"
        readonly
        placeholder="转换后查看输出"
        min-height-class="min-h-[28rem]"
        empty-message="转换结果会显示在这里。"
      />
    </div>
  </section>
</template>
