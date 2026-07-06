<script setup lang="ts">
import { Check, Clipboard, Code2, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { decodeHtmlEntities, encodeHtmlEntities } from './html-entity'

const sampleText = '<span title="A&B">Tom\'s 你好</span>'

const input = ref('')
const output = ref('')
const encodeNonAscii = ref(false)
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('等待文本')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function encodeInput() {
  resetFeedback()
  output.value = encodeHtmlEntities(input.value, {
    encodeNonAscii: encodeNonAscii.value,
  })
  meta.value = 'HTML Entity 已编码'
  liveMessage.value = meta.value
}

function decodeInput() {
  resetFeedback()
  const result = decodeHtmlEntities(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = 'HTML Entity 已解码'
  liveMessage.value = meta.value
}

function useSample() {
  input.value = sampleText
  output.value = ''
  resetFeedback()
  meta.value = '示例已载入'
  liveMessage.value = 'HTML Entity 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = '等待文本'
  liveMessage.value = 'HTML Entity 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'HTML Entity 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="HTML Entity 编解码"
      description="编码或解码 HTML 实体，支持常见命名实体和十进制/十六进制数字实体。"
      :meta="meta"
    >
      <template #icon>
        <Code2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="encodeInput">
            编码实体
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input" @click="decodeInput">
            解码实体
          </Button>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="encodeNonAscii" type="checkbox" class="h-4 w-4 accent-primary">
            非 ASCII 转数字实体
          </label>
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
        ariaLabel="HTML Entity 输入"
        :placeholder="sampleText"
        min-height-class="min-h-[28rem]"
        empty-message="粘贴 HTML 文本、属性值或包含实体的片段。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="HTML Entity 输出"
        readonly
        placeholder="执行操作后查看输出"
        min-height-class="min-h-[28rem]"
        empty-message="编码或解码结果会显示在这里。"
      />
    </div>
  </section>
</template>
