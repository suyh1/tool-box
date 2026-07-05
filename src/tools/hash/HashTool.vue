<script setup lang="ts">
import { Check, Clipboard, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { digestText, supportedHashAlgorithms, type HashAlgorithm } from './hash'

const input = ref('')
const output = ref('')
const algorithm = ref<HashAlgorithm>('SHA-256')
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)

const canCopy = computed(() => output.value.length > 0)

async function generateHash() {
  errorMessage.value = ''
  copied.value = false
  isProcessing.value = true

  try {
    const result = await digestText(input.value, algorithm.value)

    if (!result.ok) {
      errorMessage.value = result.message
      return
    }

    output.value = result.value
  } finally {
    isProcessing.value = false
  }
}

function useSample() {
  input.value = 'hello'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
}
</script>

<template>
  <section class="grid gap-4">
    <div class="rounded-lg border border-border bg-card p-4 md:p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-foreground">哈希生成</h2>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            使用浏览器 Web Crypto API 生成 SHA 摘要。
          </p>
        </div>
        <Badge variant="secondary">{{ isProcessing ? '计算中' : algorithm }}</Badge>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <select
          v-model="algorithm"
          aria-label="哈希算法"
          class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
        >
          <option v-for="item in supportedHashAlgorithms" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
        <Button type="button" :disabled="isProcessing" @click="generateHash">
          生成哈希
        </Button>
        <Button type="button" variant="ghost" @click="useSample">
          <RotateCcw class="h-4 w-4" />
          示例
        </Button>
        <Button type="button" variant="ghost" @click="clearAll">
          <Trash2 class="h-4 w-4" />
          清空
        </Button>
        <Button type="button" variant="outline" :disabled="!canCopy" @click="copyOutput">
          <Check v-if="copied" class="h-4 w-4" />
          <Clipboard v-else class="h-4 w-4" />
          复制输出
        </Button>
      </div>

      <p v-if="errorMessage" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <label class="grid gap-2 rounded-lg border border-border bg-card p-4">
        <span class="text-sm font-medium text-foreground">输入</span>
        <Textarea
          v-model="input"
          aria-label="哈希输入"
          spellcheck="false"
          placeholder="hello"
          class="min-h-[20rem] resize-y border-border bg-background/70 font-mono text-sm leading-6"
        />
      </label>

      <label class="grid gap-2 rounded-lg border border-border bg-card p-4">
        <span class="text-sm font-medium text-foreground">摘要</span>
        <Textarea
          v-model="output"
          aria-label="哈希输出"
          readonly
          spellcheck="false"
          placeholder="点击生成哈希后查看输出"
          class="min-h-[20rem] resize-y border-border bg-background/70 font-mono text-sm leading-6"
        />
      </label>
    </div>
  </section>
</template>
