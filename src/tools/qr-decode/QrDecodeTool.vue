<script setup lang="ts">
import { Check, Clipboard, ImageUp, QrCode, Trash2 } from '@lucide/vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { decodeQrPixels } from './qr-decode'
import { copyToClipboard } from '@/lib/clipboard'

const output = ref('')
const previewUrl = ref('')
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')
const meta = ref('image')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function decodeImage(url: string) {
  return new Promise<void>((resolve) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d')

      if (!context) {
        errorMessage.value = '无法读取图片像素。'
        liveMessage.value = errorMessage.value
        resolve()
        return
      }

      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const result = decodeQrPixels(imageData.data, imageData.width, imageData.height)

      if (!result.ok) {
        output.value = ''
        errorMessage.value = result.message
        liveMessage.value = result.message
        resolve()
        return
      }

      output.value = result.data
      meta.value = `v${result.version}`
      liveMessage.value = 'QR Code 已解码'
      resolve()
    }
    image.onerror = () => {
      errorMessage.value = '图片加载失败。'
      liveMessage.value = errorMessage.value
      resolve()
    }
    image.src = url
  })
}

async function handleFile(event: Event) {
  resetFeedback()
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  isProcessing.value = true
  previewUrl.value = URL.createObjectURL(file)
  await decodeImage(previewUrl.value)
  isProcessing.value = false
}

function clearAll() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'image'
  liveMessage.value = 'QR Code 解码工作区已清空'
}

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

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
  liveMessage.value = 'QR Code 解码结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="QR Code 解码" description="从本地图片读取 QR Code 内容，不上传图片。" :meta="meta">
      <template #icon>
        <QrCode class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <label class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
            <ImageUp class="h-4 w-4" />
            选择图片
            <input type="file" accept="image/*" class="sr-only" :disabled="isProcessing" @change="handleFile">
          </label>
        </template>

        <template #secondary>
          <Button type="button" variant="ghost" :disabled="isProcessing" @click="clearAll">
            <Trash2 class="h-4 w-4" />
            清空
          </Button>
          <Button type="button" variant="outline" :disabled="!canCopy || isProcessing" @click="copyOutput">
            <Check v-if="copied" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制结果
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <div v-if="previewUrl" class="flex justify-center rounded-md border border-border bg-card p-4">
      <img :src="previewUrl" alt="QR Code source" class="max-h-80 max-w-full object-contain">
    </div>

    <ToolTextareaPanel
      v-model="output"
      label="解码结果"
      ariaLabel="QR Code 解码结果"
      readonly
      placeholder="选择图片后查看解码结果"
      min-height-class="min-h-[18rem]"
      empty-message="识别到的 QR Code 内容会显示在这里。"
    />
  </section>
</template>
