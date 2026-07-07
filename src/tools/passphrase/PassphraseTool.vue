<script setup lang="ts">
import { Check, Clipboard, KeyRound, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generatePassphrase } from './passphrase'
import { copyToClipboard } from '@/lib/clipboard'

const wordCount = ref(4)
const separator = ref('-')
const capitalize = ref(false)
const includeNumber = ref(false)
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('4 words')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function generateOne() {
  resetFeedback()
  const result = generatePassphrase({
    wordCount: wordCount.value,
    separator: separator.value,
    capitalize: capitalize.value,
    includeNumber: includeNumber.value,
  })

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.passphrase
  meta.value = `${result.wordCount} words / ${result.wordListSize} wordlist`
  liveMessage.value = 'Passphrase 已生成'
}

function generateBatch() {
  resetFeedback()
  const phrases: string[] = []

  for (let index = 0; index < 5; index += 1) {
    const result = generatePassphrase({
      wordCount: wordCount.value,
      separator: separator.value,
      capitalize: capitalize.value,
      includeNumber: includeNumber.value,
    })

    if (!result.ok) {
      output.value = ''
      errorMessage.value = result.message
      liveMessage.value = result.message
      return
    }

    phrases.push(result.passphrase)
    meta.value = `${result.wordCount} words / ${result.wordListSize} wordlist`
  }

  output.value = phrases.join('\n')
  liveMessage.value = '已生成 5 个 Passphrase'
}

function useSample() {
  wordCount.value = 4
  separator.value = '-'
  capitalize.value = true
  includeNumber.value = true
  output.value = ''
  resetFeedback()
  meta.value = '4 words'
  liveMessage.value = 'Passphrase 示例选项已载入'
}

function clearAll() {
  output.value = ''
  resetFeedback()
  meta.value = `${wordCount.value} words`
  liveMessage.value = 'Passphrase 输出已清空'
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
  liveMessage.value = 'Passphrase 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="Passphrase 生成器"
      description="使用本地安全随机数从内置词表生成易记的 passphrase。"
      :meta="meta"
    >
      <template #icon>
        <KeyRound class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 lg:grid-cols-[10rem_10rem_minmax(0,1fr)]">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          词数
          <Input v-model.number="wordCount" type="number" min="3" max="12" step="1" aria-label="Passphrase 词数" />
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          分隔符
          <Input v-model="separator" maxlength="4" aria-label="Passphrase 分隔符" />
        </label>
        <div class="grid content-end gap-2 sm:grid-cols-2">
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="capitalize" type="checkbox" class="h-4 w-4 accent-primary">
            首字母大写
          </label>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="includeNumber" type="checkbox" class="h-4 w-4 accent-primary">
            追加数字
          </label>
        </div>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="generateOne">
            生成 Passphrase
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" @click="generateBatch">
            生成 5 个
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
      label="生成结果"
      ariaLabel="Passphrase 生成结果"
      readonly
      placeholder="点击生成 Passphrase"
      min-height-class="min-h-[18rem]"
      empty-message="生成的 passphrase 会显示在这里，每个占一行。"
    />
  </section>
</template>
