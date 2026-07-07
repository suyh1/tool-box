<script setup lang="ts">
import { Check, Clipboard, KeyRound, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { jwkToPem, pemToJwk } from './jwk-pem'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')
const meta = ref('RSA')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

async function convertPemToJwk() {
  resetFeedback()
  isProcessing.value = true
  const result = await pemToJwk(input.value)
  isProcessing.value = false

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result.value, null, 2)
  meta.value = `${result.keyType === 'public' ? '公钥' : '私钥'} JWK`
  liveMessage.value = 'PEM 已转换为 JWK'
}

async function convertJwkToPem() {
  resetFeedback()

  let jwk: JsonWebKey

  try {
    jwk = JSON.parse(input.value) as JsonWebKey
  } catch (error) {
    output.value = ''
    errorMessage.value = `JWK JSON 无效：${error instanceof Error ? error.message : '解析失败'}`
    liveMessage.value = errorMessage.value
    return
  }

  isProcessing.value = true
  const result = await jwkToPem(jwk)
  isProcessing.value = false

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = `${result.keyType === 'public' ? '公钥' : '私钥'} PEM`
  liveMessage.value = 'JWK 已转换为 PEM'
}

function arrayBufferToPem(buffer: ArrayBuffer, label: string) {
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  const body = btoa(binary).match(/.{1,64}/g)?.join('\n') ?? ''
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`
}

async function useSample() {
  resetFeedback()
  isProcessing.value = true
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  )
  const spki = await crypto.subtle.exportKey('spki', keyPair.publicKey)
  isProcessing.value = false
  input.value = arrayBufferToPem(spki, 'PUBLIC KEY')
  output.value = ''
  meta.value = '示例已载入'
  liveMessage.value = 'JWK / PEM 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'RSA'
  liveMessage.value = 'JWK / PEM 工作区已清空'
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
  liveMessage.value = 'JWK / PEM 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="JWK / PEM 转换"
      description="本地在 RSA PUBLIC KEY / PRIVATE KEY PEM 和 JWK JSON 之间转换。"
      :meta="meta"
    >
      <template #icon>
        <KeyRound class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input || isProcessing" @click="convertPemToJwk">
            PEM 转 JWK
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input || isProcessing" @click="convertJwkToPem">
            JWK 转 PEM
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
        ariaLabel="JWK PEM 输入"
        placeholder="-----BEGIN PUBLIC KEY-----"
        min-height-class="min-h-[30rem]"
        empty-message="粘贴 RSA PEM 或 JWK JSON。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="JWK PEM 输出"
        readonly
        placeholder="转换后查看输出"
        min-height-class="min-h-[30rem]"
        empty-message="转换结果会显示在这里。"
      />
    </div>
  </section>
</template>
