<script setup lang="ts">
import { Check, Clipboard, KeyRound, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generateRsaKeyPair } from '../rsa-key/rsa-key'
import {
  signRsaMessage,
  supportedRsaSignAlgorithms,
  supportedRsaSignHashes,
  type RsaSignAlgorithm,
  type RsaSignHash,
  verifyRsaSignature,
} from './rsa-sign'
import { copyToClipboard } from '@/lib/clipboard'

const message = ref('')
const privatePem = ref('')
const publicPem = ref('')
const signature = ref('')
const resultOutput = ref('')
const algorithm = ref<RsaSignAlgorithm>('RSASSA-PKCS1-v1_5')
const hash = ref<RsaSignHash>('SHA-256')
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => signature.value.length > 0 || resultOutput.value.length > 0)
const meta = computed(() => `${algorithm.value} / ${hash.value}`)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

async function signMessage() {
  resetFeedback()
  isProcessing.value = true
  const result = await signRsaMessage(message.value, privatePem.value, {
    algorithm: algorithm.value,
    hash: hash.value,
  })
  isProcessing.value = false

  if (!result.ok) {
    signature.value = ''
    resultOutput.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  signature.value = result.signatureBase64
  resultOutput.value = JSON.stringify({
    algorithm: result.algorithm,
    hash: result.hash,
  }, null, 2)
  liveMessage.value = 'RSA 签名已生成'
}

async function verifySignature() {
  resetFeedback()
  isProcessing.value = true
  const result = await verifyRsaSignature(message.value, signature.value, publicPem.value, {
    algorithm: algorithm.value,
    hash: hash.value,
  })
  isProcessing.value = false

  if (!result.ok) {
    resultOutput.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  resultOutput.value = JSON.stringify(result, null, 2)
  liveMessage.value = result.verified ? 'RSA 验签通过' : 'RSA 验签未通过'
}

async function useSample() {
  resetFeedback()
  isProcessing.value = true
  const keys = await generateRsaKeyPair({
    algorithm: algorithm.value,
    hash: hash.value,
    modulusLength: 2048,
  })
  isProcessing.value = false

  if (!keys.ok) {
    errorMessage.value = keys.message
    liveMessage.value = keys.message
    return
  }

  message.value = 'hello 你好'
  privatePem.value = keys.privatePem
  publicPem.value = keys.publicPem
  signature.value = ''
  resultOutput.value = ''
  liveMessage.value = 'RSA 签名示例已载入'
}

function clearAll() {
  message.value = ''
  privatePem.value = ''
  publicPem.value = ''
  signature.value = ''
  resultOutput.value = ''
  resetFeedback()
  liveMessage.value = 'RSA 签名工作区已清空'
}

async function copyOutput() {
  const value = signature.value || resultOutput.value

  if (!value) {
    return
  }

  const clipboardResult = await copyToClipboard(value)
  if (!clipboardResult.ok) {
    liveMessage.value = clipboardResult.message
    return
  }
  copied.value = true
  liveMessage.value = 'RSA 签名输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="RSA 签名 / 验签"
      description="使用 RSA 签名 PEM 私钥生成 Base64 签名，并用公钥验证。"
      :meta="meta"
    >
      <template #icon>
        <KeyRound class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="isProcessing || !privatePem" @click="signMessage">
            签名
          </Button>
        </template>

        <template #secondary>
          <select
            v-model="algorithm"
            aria-label="RSA 签名算法"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in supportedRsaSignAlgorithms" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <select
            v-model="hash"
            aria-label="RSA 签名 hash"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in supportedRsaSignHashes" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <Button type="button" variant="secondary" :disabled="isProcessing || !publicPem || !signature" @click="verifySignature">
            验签
          </Button>
          <Button type="button" variant="ghost" :disabled="isProcessing" @click="useSample">
            <RotateCcw class="h-4 w-4" />
            示例密钥
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
        v-model="message"
        label="消息"
        ariaLabel="RSA 签名消息"
        placeholder="hello 你好"
        min-height-class="min-h-[14rem]"
        empty-message="输入要签名或验证的原文。"
      />
      <ToolTextareaPanel
        v-model="signature"
        label="Base64 签名"
        ariaLabel="RSA Base64 签名"
        placeholder="签名后查看或粘贴签名"
        min-height-class="min-h-[14rem]"
        empty-message="Base64 签名会显示在这里。"
      />
      <ToolTextareaPanel
        v-model="privatePem"
        label="Private Key PEM"
        ariaLabel="RSA private key PEM"
        placeholder="-----BEGIN PRIVATE KEY-----"
        min-height-class="min-h-[22rem]"
        empty-message="签名时粘贴私钥 PEM。"
      />
      <ToolTextareaPanel
        v-model="publicPem"
        label="Public Key PEM"
        ariaLabel="RSA public key PEM"
        placeholder="-----BEGIN PUBLIC KEY-----"
        min-height-class="min-h-[22rem]"
        empty-message="验签时粘贴公钥 PEM。"
      />
    </div>

    <ToolTextareaPanel
      v-model="resultOutput"
      label="结果"
      ariaLabel="RSA 签名验签结果"
      readonly
      placeholder="执行后查看结果"
      min-height-class="min-h-[10rem]"
      empty-message="签名元数据或验签结果会显示在这里。"
    />
  </section>
</template>
