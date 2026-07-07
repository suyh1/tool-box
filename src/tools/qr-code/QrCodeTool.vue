<script setup lang="ts">
import { Check, Clipboard, QrCode, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generateQrCode, type QrCodeFormat } from './qr-code'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('https://example.com')
const output = ref('')
const format = ref<QrCodeFormat>('svg')
const margin = ref(4)
const scale = ref(6)
const errorCorrectionLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')
const meta = ref('SVG')

const canCopy = computed(() => output.value.length > 0)
const previewUrl = computed(() => format.value === 'dataUrl' && output.value.startsWith('data:image/') ? output.value : '')

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

async function generateCode() {
  resetFeedback()
  isProcessing.value = true
  const result = await generateQrCode(input.value, {
    format: format.value,
    margin: margin.value,
    scale: scale.value,
    errorCorrectionLevel: errorCorrectionLevel.value,
  })
  isProcessing.value = false

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.output
  meta.value = `${result.format} / v${result.version}`
  liveMessage.value = 'QR Code 已生成'
}

function useSample() {
  input.value = 'https://example.com'
  format.value = 'svg'
  margin.value = 4
  scale.value = 6
  errorCorrectionLevel.value = 'M'
  output.value = ''
  resetFeedback()
  meta.value = 'SVG'
  liveMessage.value = 'QR Code 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = format.value.toUpperCase()
  liveMessage.value = 'QR Code 工作区已清空'
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
  liveMessage.value = 'QR Code 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="QR Code 生成" description="把文本或 URL 本地编码为 SVG 或 PNG Data URL QR Code。" :meta="meta">
      <template #icon>
        <QrCode class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_9rem_8rem_8rem_8rem]">
        <Input v-model="input" aria-label="QR Code 内容" placeholder="https://example.com" />
        <select v-model="format" aria-label="QR Code 输出格式" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
          <option value="svg">SVG</option>
          <option value="dataUrl">PNG Data URL</option>
        </select>
        <select v-model="errorCorrectionLevel" aria-label="QR Code 容错级别" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
          <option value="L">L</option>
          <option value="M">M</option>
          <option value="Q">Q</option>
          <option value="H">H</option>
        </select>
        <Input v-model.number="margin" type="number" min="0" max="12" step="1" aria-label="QR Code margin" />
        <Input v-model.number="scale" type="number" min="1" max="20" step="1" aria-label="QR Code scale" />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input || isProcessing" @click="generateCode">
            生成 QR Code
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="ghost" :disabled="isProcessing" @click="useSample">
            <RotateCcw class="h-4 w-4" />
            示例
          </Button>
          <Button type="button" variant="ghost" :disabled="isProcessing" @click="clearAll">
            <Trash2 class="h-4 w-4" />
            清空
          </Button>
          <Button type="button" variant="outline" :disabled="!canCopy || isProcessing" @click="copyOutput">
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

    <div v-if="previewUrl" class="flex justify-center rounded-md border border-border bg-card p-4">
      <img :src="previewUrl" alt="QR Code preview" class="h-64 w-64 object-contain">
    </div>

    <ToolTextareaPanel
      v-model="output"
      label="输出"
      ariaLabel="QR Code 输出"
      readonly
      placeholder="点击生成 QR Code"
      min-height-class="min-h-[20rem]"
      empty-message="SVG 或 PNG Data URL 会显示在这里。"
    />
  </section>
</template>
