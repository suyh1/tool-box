<script setup lang="ts">
import { Check, Clipboard, Hash as HashIcon, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { digestText, supportedHashAlgorithms, type HashAlgorithm } from './hash'

const input = ref('')
const output = ref('')
const algorithm = ref<HashAlgorithm>('SHA-256')
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)
const metaLabel = computed(() => isProcessing.value ? '计算中' : algorithm.value)

async function generateHash() {
  errorMessage.value = ''
  copied.value = false
  isProcessing.value = true

  try {
    const result = await digestText(input.value, algorithm.value)

    if (!result.ok) {
      errorMessage.value = result.message
      liveMessage.value = result.message
      return
    }

    output.value = result.value
    liveMessage.value = `${algorithm.value} 摘要已生成`
  } finally {
    isProcessing.value = false
  }
}

function useSample() {
  input.value = 'hello'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  liveMessage.value = '哈希示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  liveMessage.value = '哈希工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '哈希输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="哈希生成"
      description="使用浏览器 Web Crypto API 生成 SHA 摘要，适合校验文本、密钥片段和测试载荷。"
      :meta="metaLabel"
    >
      <template #icon>
        <HashIcon class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="isProcessing" @click="generateHash">
            生成哈希
          </Button>
        </template>

        <template #secondary>
          <label class="sr-only" for="hash-algorithm">哈希算法</label>
          <select
            id="hash-algorithm"
            v-model="algorithm"
            aria-label="哈希算法"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in supportedHashAlgorithms" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
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
        ariaLabel="哈希输入"
        placeholder="hello"
        empty-message="粘贴任意文本以生成 SHA 摘要。空字符串也可以计算。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="摘要"
        ariaLabel="哈希输出"
        readonly
        placeholder="点击生成哈希后查看输出"
        empty-message="生成 SHA 摘要后会显示十六进制输出，内容不离开浏览器。"
      />
    </div>
  </section>
</template>
