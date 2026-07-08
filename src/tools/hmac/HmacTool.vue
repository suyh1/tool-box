<script setup lang="ts">
import { Check, Clipboard, Hash, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generateHmac, supportedHmacAlgorithms, type HmacAlgorithm } from './hmac'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('')
const output = ref('')
const secret = ref('')
const algorithm = ref<HmacAlgorithm>('SHA-256')
const outputFormat = ref<'hex' | 'base64'>('hex')
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)
const meta = computed(() => `${algorithm.value} / ${outputFormat.value.toUpperCase()}`)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

async function generate() {
  resetFeedback()
  isProcessing.value = true
  const result = await generateHmac(input.value, secret.value, algorithm.value)
  isProcessing.value = false

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = outputFormat.value === 'hex' ? result.hex : result.base64
  liveMessage.value = 'HMAC 已生成'
}

function useSample() {
  input.value = 'hello'
  secret.value = 'secret'
  output.value = ''
  resetFeedback()
  liveMessage.value = 'HMAC 示例已载入'
}

function clearAll() {
  input.value = ''
  secret.value = ''
  output.value = ''
  resetFeedback()
  liveMessage.value = 'HMAC 工作区已清空'
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
  liveMessage.value = 'HMAC 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="HMAC 生成"
      description="使用本地 Web Crypto API 生成 HMAC SHA 签名。"
      :meta="meta"
    >
      <template #icon>
        <Hash class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="isProcessing || !secret" @click="generate">
            生成 HMAC
          </Button>
        </template>

        <template #secondary>
          <select
            v-model="algorithm"
            aria-label="HMAC 算法"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in supportedHmacAlgorithms" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <select
            v-model="outputFormat"
            aria-label="HMAC 输出格式"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
          </select>
          <Input
            v-model="secret"
            type="password"
            autocomplete="off"
            aria-label="HMAC 密钥"
            placeholder="secret"
            class="h-9 w-44"
          />
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

      <p
        v-if="algorithm === 'SHA-1'"
        class="mt-3 rounded-md border border-border bg-background/45 px-3 py-2 text-sm text-muted-foreground"
      >
        SHA-1 仅用于兼容旧系统，新签名优先使用 SHA-256 或更高强度算法。
      </p>

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
        ariaLabel="HMAC 输入"
        placeholder="hello"
        min-height-class="min-h-[28rem]"
        empty-message="粘贴需要签名的文本。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="HMAC 输出"
        readonly
        placeholder="生成后查看签名"
        min-height-class="min-h-[28rem]"
        empty-message="HMAC 签名会显示在这里。"
      />
    </div>
  </section>
</template>
