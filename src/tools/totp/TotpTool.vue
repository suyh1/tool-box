<script setup lang="ts">
import { Check, Clipboard, KeyRound, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generateTotp, supportedTotpAlgorithms, supportedTotpDigits, type TotpAlgorithm, type TotpDigits, verifyTotp } from './totp'
import { copyToClipboard } from '@/lib/clipboard'

const secret = ref('')
const code = ref('')
const output = ref('')
const algorithm = ref<TotpAlgorithm>('SHA-1')
const digits = ref<TotpDigits>(6)
const period = ref(30)
const window = ref(1)
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')
const meta = ref('SHA-1 / 30s')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

async function generateCode() {
  resetFeedback()
  isProcessing.value = true
  const result = await generateTotp(secret.value, {
    algorithm: algorithm.value,
    digits: digits.value,
    period: period.value,
  })
  isProcessing.value = false

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  code.value = result.code
  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.algorithm} / ${result.period}s`
  liveMessage.value = 'TOTP 已生成'
}

async function verifyCode() {
  resetFeedback()
  isProcessing.value = true
  const result = await verifyTotp(code.value, secret.value, {
    algorithm: algorithm.value,
    digits: digits.value,
    period: period.value,
    window: window.value,
  })
  isProcessing.value = false

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  liveMessage.value = result.verified ? 'TOTP 校验通过' : 'TOTP 校验未通过'
}

function useSample() {
  secret.value = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'
  code.value = ''
  output.value = ''
  algorithm.value = 'SHA-1'
  digits.value = 8
  period.value = 30
  window.value = 1
  resetFeedback()
  meta.value = 'SHA-1 / 30s'
  liveMessage.value = 'TOTP 示例已载入'
}

function clearAll() {
  secret.value = ''
  code.value = ''
  output.value = ''
  resetFeedback()
  meta.value = `${algorithm.value} / ${period.value}s`
  liveMessage.value = 'TOTP 工作区已清空'
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
  liveMessage.value = 'TOTP 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="TOTP 生成 / 校验"
      description="基于 Base32 secret 生成和校验 RFC 6238 TOTP。"
      :meta="meta"
    >
      <template #icon>
        <KeyRound class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)]">
        <Input v-model="secret" aria-label="TOTP Base32 secret" placeholder="Base32 secret" />
        <Input v-model="code" aria-label="TOTP code" placeholder="TOTP code" />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="isProcessing || !secret" @click="generateCode">
            生成 TOTP
          </Button>
        </template>

        <template #secondary>
          <select
            v-model="algorithm"
            aria-label="TOTP 算法"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in supportedTotpAlgorithms" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <select
            v-model.number="digits"
            aria-label="TOTP 位数"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in supportedTotpDigits" :key="item" :value="item">
              {{ item }} 位
            </option>
          </select>
          <Input v-model.number="period" type="number" min="1" step="1" aria-label="TOTP period" class="h-9 w-24" />
          <Input v-model.number="window" type="number" min="0" max="10" step="1" aria-label="TOTP window" class="h-9 w-24" />
          <Button type="button" variant="secondary" :disabled="isProcessing || !secret || !code" @click="verifyCode">
            校验
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

    <ToolTextareaPanel
      v-model="output"
      label="结果"
      ariaLabel="TOTP 结果"
      readonly
      placeholder="生成或校验后查看结果"
      min-height-class="min-h-[24rem]"
      empty-message="TOTP 代码、剩余秒数或校验结果会显示在这里。"
    />
  </section>
</template>
