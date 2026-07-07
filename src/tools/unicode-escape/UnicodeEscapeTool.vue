<script setup lang="ts">
import { Check, Clipboard, Code2, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { decodeUnicodeEscapes, encodeUnicodeEscapes } from './unicode-escape'
import { copyToClipboard } from '@/lib/clipboard'

const sampleText = 'Hello 你好 😄'

const input = ref('')
const output = ref('')
const encodeAscii = ref(false)
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
  output.value = encodeUnicodeEscapes(input.value, {
    encodeAscii: encodeAscii.value,
  })
  meta.value = 'Unicode Escape 已编码'
  liveMessage.value = meta.value
}

function decodeInput() {
  resetFeedback()
  const result = decodeUnicodeEscapes(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = 'Unicode Escape 已解码'
  liveMessage.value = meta.value
}

function useSample() {
  input.value = sampleText
  output.value = ''
  resetFeedback()
  meta.value = '示例已载入'
  liveMessage.value = 'Unicode Escape 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = '等待文本'
  liveMessage.value = 'Unicode Escape 工作区已清空'
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
  liveMessage.value = 'Unicode Escape 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="Unicode Escape 编解码"
      description="在普通文本和 JavaScript 风格 \\uXXXX Unicode 转义之间转换。"
      :meta="meta"
    >
      <template #icon>
        <Code2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="encodeInput">
            编码 Unicode
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input" @click="decodeInput">
            解码 Unicode
          </Button>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="encodeAscii" type="checkbox" class="h-4 w-4 accent-primary">
            ASCII 也转义
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
        ariaLabel="Unicode Escape 输入"
        :placeholder="sampleText"
        min-height-class="min-h-[28rem]"
        empty-message="粘贴普通文本或包含 \\uXXXX 的文本。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="Unicode Escape 输出"
        readonly
        placeholder="执行操作后查看输出"
        min-height-class="min-h-[28rem]"
        empty-message="编码或解码结果会显示在这里。"
      />
    </div>
  </section>
</template>
