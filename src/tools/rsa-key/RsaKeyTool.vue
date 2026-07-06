<script setup lang="ts">
import { Check, Clipboard, KeyRound, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import {
  generateRsaKeyPair,
  supportedRsaHashes,
  supportedRsaKeyAlgorithms,
  supportedRsaModulusLengths,
  type RsaHash,
  type RsaKeyAlgorithm,
  type RsaModulusLength,
} from './rsa-key'

const algorithm = ref<RsaKeyAlgorithm>('RSASSA-PKCS1-v1_5')
const hash = ref<RsaHash>('SHA-256')
const modulusLength = ref<RsaModulusLength>(2048)
const publicOutput = ref('')
const privateOutput = ref('')
const jwkOutput = ref('')
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => publicOutput.value.length > 0 || privateOutput.value.length > 0)
const meta = computed(() => `${algorithm.value} / ${modulusLength.value}`)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

async function generateKeys() {
  resetFeedback()
  isProcessing.value = true
  const result = await generateRsaKeyPair({
    algorithm: algorithm.value,
    hash: hash.value,
    modulusLength: modulusLength.value,
  })
  isProcessing.value = false

  if (!result.ok) {
    publicOutput.value = ''
    privateOutput.value = ''
    jwkOutput.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  publicOutput.value = result.publicPem
  privateOutput.value = result.privatePem
  jwkOutput.value = JSON.stringify({
    publicJwk: result.publicJwk,
    privateJwk: result.privateJwk,
  }, null, 2)
  liveMessage.value = 'RSA 密钥对已生成'
}

function clearAll() {
  publicOutput.value = ''
  privateOutput.value = ''
  jwkOutput.value = ''
  resetFeedback()
  liveMessage.value = 'RSA 密钥工作区已清空'
}

async function copyAll() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText([
    publicOutput.value,
    '',
    privateOutput.value,
    '',
    jwkOutput.value,
  ].join('\n'))
  copied.value = true
  liveMessage.value = 'RSA 密钥输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="RSA 密钥生成"
      description="使用本地 Web Crypto API 生成可导出的 RSA 公私钥。"
      :meta="meta"
    >
      <template #icon>
        <KeyRound class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="isProcessing" @click="generateKeys">
            生成密钥
          </Button>
        </template>

        <template #secondary>
          <select
            v-model="algorithm"
            aria-label="RSA 算法"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in supportedRsaKeyAlgorithms" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <select
            v-model="hash"
            aria-label="RSA hash"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in supportedRsaHashes" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <select
            v-model.number="modulusLength"
            aria-label="RSA 模长"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in supportedRsaModulusLengths" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <Button type="button" variant="ghost" :disabled="isProcessing" @click="clearAll">
            <Trash2 class="h-4 w-4" />
            清空
          </Button>
          <Button type="button" variant="outline" :disabled="!canCopy || isProcessing" @click="copyAll">
            <Check v-if="copied" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制全部
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
        v-model="publicOutput"
        label="Public Key PEM"
        ariaLabel="RSA public key PEM"
        readonly
        placeholder="点击生成密钥"
        min-height-class="min-h-[22rem]"
        empty-message="公钥 PEM 会显示在这里。"
      />

      <ToolTextareaPanel
        v-model="privateOutput"
        label="Private Key PEM"
        ariaLabel="RSA private key PEM"
        readonly
        placeholder="点击生成密钥"
        min-height-class="min-h-[22rem]"
        empty-message="私钥 PEM 会显示在这里。"
      />
    </div>

    <ToolTextareaPanel
      v-model="jwkOutput"
      label="JWK"
      ariaLabel="RSA JWK"
      readonly
      placeholder="点击生成密钥"
      min-height-class="min-h-[18rem]"
      empty-message="公私钥 JWK 会显示在这里。"
    />
  </section>
</template>
