<script setup lang="ts">
import { Archive, Check, Clipboard, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { compressTextToBrotliBase64, decompressBrotliBase64ToText } from './brotli'

const sampleText = 'Brotli 你好\nBrotli 你好\n'

const input = ref('')
const output = ref('')
const quality = ref(6)
const isWorking = ref(false)
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('等待文本')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function formatBytes(bytes: number) {
  return `${bytes.toLocaleString()} B`
}

async function compressInput() {
  resetFeedback()
  isWorking.value = true
  const result = await compressTextToBrotliBase64(input.value, { quality: quality.value })
  isWorking.value = false

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = `${formatBytes(result.originalBytes)} -> ${formatBytes(result.compressedBytes)}`
  liveMessage.value = 'Brotli 已压缩为 Base64'
}

async function decompressInput() {
  resetFeedback()
  isWorking.value = true
  const result = await decompressBrotliBase64ToText(input.value)
  isWorking.value = false

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = `${formatBytes(result.compressedBytes)} -> ${formatBytes(result.outputBytes)}`
  liveMessage.value = 'Brotli Base64 已解压'
}

function useSample() {
  input.value = sampleText
  output.value = ''
  resetFeedback()
  meta.value = '示例已载入'
  liveMessage.value = 'Brotli 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = '等待文本'
  liveMessage.value = 'Brotli 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'Brotli 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="Brotli 压缩 / 解压"
      description="把 UTF-8 文本压缩为 Brotli Base64，或将 Brotli Base64 解压回文本。"
      :meta="meta"
    >
      <template #icon>
        <Archive class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input || isWorking" @click="compressInput">
            文本压缩
          </Button>
        </template>

        <template #secondary>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            质量
            <Input
              v-model.number="quality"
              type="number"
              min="1"
              max="11"
              step="1"
              class="h-9 w-20"
              aria-label="Brotli 压缩质量"
            />
          </label>
          <Button type="button" variant="secondary" :disabled="!input || isWorking" @click="decompressInput">
            Base64 解压
          </Button>
          <Button type="button" variant="ghost" :disabled="isWorking" @click="useSample">
            <RotateCcw class="h-4 w-4" />
            示例
          </Button>
          <Button type="button" variant="ghost" :disabled="isWorking" @click="clearAll">
            <Trash2 class="h-4 w-4" />
            清空
          </Button>
          <Button type="button" variant="outline" :disabled="!canCopy || isWorking" @click="copyOutput">
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
        ariaLabel="Brotli 输入"
        :placeholder="sampleText"
        min-height-class="min-h-[28rem]"
        empty-message="粘贴文本进行压缩，或粘贴 Brotli Base64 进行解压。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="Brotli 输出"
        readonly
        placeholder="执行操作后查看输出"
        min-height-class="min-h-[28rem]"
        empty-message="压缩后的 Base64 或解压后的文本会显示在这里。"
      />
    </div>
  </section>
</template>
