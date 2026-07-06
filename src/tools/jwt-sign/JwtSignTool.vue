<script setup lang="ts">
import { Check, Clipboard, KeyRound, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { signJwt, supportedJwtAlgorithms, type JwtAlgorithm, verifyJwtSignature } from './jwt-sign'

const sampleHeader = '{\n  "typ": "JWT",\n  "kid": "local"\n}'
const samplePayload = '{\n  "sub": "1234567890",\n  "name": "Toolbox",\n  "admin": true\n}'

const headerJson = ref(sampleHeader)
const payloadJson = ref(samplePayload)
const token = ref('')
const secret = ref('secret')
const algorithm = ref<JwtAlgorithm>('HS256')
const resultOutput = ref('')
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')
const meta = ref('HS256')

const canCopy = computed(() => token.value.length > 0 || resultOutput.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function parseJson(value: string, label: string) {
  try {
    return {
      ok: true as const,
      value: JSON.parse(value) as unknown,
    }
  } catch (error) {
    return {
      ok: false as const,
      message: `${label} 不是有效 JSON：${error instanceof Error ? error.message : '解析失败'}`,
    }
  }
}

function formatResult(value: unknown) {
  return JSON.stringify(value, null, 2)
}

async function signInput() {
  resetFeedback()
  const header = parseJson(headerJson.value, 'Header')
  const payload = parseJson(payloadJson.value, 'Payload')

  if (!header.ok) {
    errorMessage.value = header.message
    liveMessage.value = errorMessage.value
    return
  }

  if (!payload.ok) {
    errorMessage.value = payload.message
    liveMessage.value = errorMessage.value
    return
  }

  isProcessing.value = true
  const result = await signJwt({
    algorithm: algorithm.value,
    secret: secret.value,
    header: header.value as Record<string, unknown>,
    payload: payload.value,
  })
  isProcessing.value = false

  if (!result.ok) {
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  token.value = result.token
  resultOutput.value = formatResult({
    algorithm: result.algorithm,
    header: result.header,
    payload: result.payload,
  })
  meta.value = `${result.algorithm} 已签发`
  liveMessage.value = 'JWT 已签发'
}

async function verifyInput() {
  resetFeedback()
  isProcessing.value = true
  const result = await verifyJwtSignature(token.value, secret.value)
  isProcessing.value = false

  if (!result.ok) {
    resultOutput.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  resultOutput.value = formatResult({
    verified: result.verified,
    algorithm: result.algorithm,
    header: result.header,
    payload: result.payload,
  })
  meta.value = result.verified ? '验签通过' : '验签未通过'
  liveMessage.value = meta.value
}

function useSample() {
  headerJson.value = sampleHeader
  payloadJson.value = samplePayload
  token.value = ''
  secret.value = 'secret'
  algorithm.value = 'HS256'
  resultOutput.value = ''
  resetFeedback()
  meta.value = 'HS256'
  liveMessage.value = 'JWT 签名示例已载入'
}

function clearAll() {
  headerJson.value = ''
  payloadJson.value = ''
  token.value = ''
  secret.value = ''
  resultOutput.value = ''
  resetFeedback()
  meta.value = algorithm.value
  liveMessage.value = 'JWT 签名工作区已清空'
}

async function copyOutput() {
  const value = token.value || resultOutput.value

  if (!value) {
    return
  }

  await navigator.clipboard.writeText(value)
  copied.value = true
  liveMessage.value = 'JWT 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="JWT 编码 / 签名 / 验签"
      description="本地使用 HMAC SHA 算法签发 JWT，并验证已有 JWT 的签名。"
      :meta="meta"
    >
      <template #icon>
        <KeyRound class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="isProcessing || !secret" @click="signInput">
            签发 JWT
          </Button>
        </template>

        <template #secondary>
          <label class="sr-only" for="jwt-sign-algorithm">JWT 算法</label>
          <select
            id="jwt-sign-algorithm"
            v-model="algorithm"
            aria-label="JWT 算法"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in supportedJwtAlgorithms" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <Input
            v-model="secret"
            type="password"
            autocomplete="off"
            aria-label="JWT HMAC 密钥"
            placeholder="secret"
            class="h-9 w-44"
          />
          <Button type="button" variant="secondary" :disabled="isProcessing || !token || !secret" @click="verifyInput">
            验证签名
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

    <div class="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div class="grid gap-4">
        <ToolTextareaPanel
          v-model="headerJson"
          label="Header JSON"
          ariaLabel="JWT Header JSON"
          :placeholder="sampleHeader"
          min-height-class="min-h-[12rem]"
          empty-message="输入 JWT header JSON。alg 会按所选算法覆盖。"
        />
        <ToolTextareaPanel
          v-model="payloadJson"
          label="Payload JSON"
          ariaLabel="JWT Payload JSON"
          :placeholder="samplePayload"
          min-height-class="min-h-[18rem]"
          empty-message="输入 JWT payload JSON。"
        />
      </div>

      <div class="grid gap-4">
        <ToolTextareaPanel
          v-model="token"
          label="JWT"
          ariaLabel="JWT token"
          placeholder="header.payload.signature"
          min-height-class="min-h-[12rem]"
          empty-message="签发后的 JWT 会出现在这里，也可以粘贴已有 JWT 进行验签。"
        />
        <ToolTextareaPanel
          v-model="resultOutput"
          label="结果"
          ariaLabel="JWT 签名结果"
          readonly
          placeholder="签发或验签后查看结果"
          min-height-class="min-h-[18rem]"
          empty-message="签发元数据或验签结果会显示在这里。"
        />
      </div>
    </div>
  </section>
</template>
