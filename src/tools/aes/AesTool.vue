<script setup lang="ts">
import { Check, Clipboard, KeyRound, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { decryptAesGcm, encryptAesGcm, randomHex } from './aes'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('')
const output = ref('')
const keyHex = ref('')
const ivHex = ref('')
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')
const meta = ref('AES-GCM')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

async function encryptInput() {
  resetFeedback()
  isProcessing.value = true
  const result = await encryptAesGcm(input.value, keyHex.value, ivHex.value)
  isProcessing.value = false

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.ciphertextBase64
  meta.value = result.algorithm
  liveMessage.value = 'AES-GCM 已加密'
}

async function decryptInput() {
  resetFeedback()
  isProcessing.value = true
  const result = await decryptAesGcm(input.value, keyHex.value, ivHex.value)
  isProcessing.value = false

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.plaintext
  meta.value = result.algorithm
  liveMessage.value = 'AES-GCM 已解密'
}

function generateMaterial() {
  keyHex.value = randomHex(32)
  ivHex.value = randomHex(12)
  resetFeedback()
  liveMessage.value = 'AES key 和 IV 已生成'
}

function useSample() {
  input.value = 'hello 你好'
  keyHex.value = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'
  ivHex.value = '1a1b1c1d1e1f202122232425'
  output.value = ''
  resetFeedback()
  meta.value = 'AES-GCM'
  liveMessage.value = 'AES 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  keyHex.value = ''
  ivHex.value = ''
  resetFeedback()
  meta.value = 'AES-GCM'
  liveMessage.value = 'AES 工作区已清空'
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
  liveMessage.value = 'AES 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="AES 加密 / 解密"
      description="使用 AES-GCM 在本地加密文本或解密 Base64 密文。"
      :meta="meta"
    >
      <template #icon>
        <KeyRound class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)]">
        <Input v-model="keyHex" aria-label="AES key 十六进制" placeholder="AES key hex" />
        <Input v-model="ivHex" aria-label="AES-GCM IV 十六进制" placeholder="12-byte IV hex" />
      </div>
      <p class="mt-2 text-xs leading-5 text-muted-foreground">
        同一 AES-GCM key 下 IV 不得重复。复用 IV 会破坏密文和认证标签的安全性。
      </p>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="isProcessing || !keyHex || !ivHex" @click="encryptInput">
            加密
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="isProcessing || !input || !keyHex || !ivHex" @click="decryptInput">
            解密
          </Button>
          <Button type="button" variant="ghost" :disabled="isProcessing" @click="generateMaterial">
            <KeyRound class="h-4 w-4" />
            生成 Key/IV
          </Button>
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
        ariaLabel="AES 输入"
        placeholder="hello 你好"
        min-height-class="min-h-[28rem]"
        empty-message="加密时输入明文；解密时输入 Base64 密文。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="AES 输出"
        readonly
        placeholder="执行后查看输出"
        min-height-class="min-h-[28rem]"
        empty-message="加密后的 Base64 或解密后的明文会显示在这里。"
      />
    </div>
  </section>
</template>
