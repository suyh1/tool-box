<script setup lang="ts">
import { Check, Clipboard, Hash, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { defaultNanoIdAlphabet, generateNanoId } from './nanoid'
import { copyToClipboard } from '@/lib/clipboard'

const length = ref(21)
const alphabet = ref(defaultNanoIdAlphabet)
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('21 chars')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function generateOne() {
  resetFeedback()
  const result = generateNanoId({ length: length.value, alphabet: alphabet.value })

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.id
  meta.value = `${result.length} chars / ${result.alphabetSize} alphabet`
  liveMessage.value = 'Nano ID 已生成'
}

function generateBatch() {
  resetFeedback()
  const values: string[] = []

  for (let index = 0; index < 5; index += 1) {
    const result = generateNanoId({ length: length.value, alphabet: alphabet.value })

    if (!result.ok) {
      output.value = ''
      errorMessage.value = result.message
      liveMessage.value = result.message
      return
    }

    values.push(result.id)
    meta.value = `${result.length} chars / ${result.alphabetSize} alphabet`
  }

  output.value = values.join('\n')
  liveMessage.value = '已生成 5 个 Nano ID'
}

function useSample() {
  length.value = 21
  alphabet.value = defaultNanoIdAlphabet
  output.value = ''
  resetFeedback()
  meta.value = '21 chars'
  liveMessage.value = 'Nano ID 示例选项已载入'
}

function clearAll() {
  output.value = ''
  resetFeedback()
  meta.value = `${length.value} chars`
  liveMessage.value = 'Nano ID 输出已清空'
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
  liveMessage.value = 'Nano ID 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Nano ID 生成" description="使用自定义字符集生成短小、URL 友好的随机 ID。" :meta="meta">
      <template #icon>
        <Hash class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 lg:grid-cols-[10rem_minmax(0,1fr)]">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          长度
          <Input v-model.number="length" type="number" min="1" max="256" step="1" aria-label="Nano ID 长度" />
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          字符集
          <Input v-model="alphabet" aria-label="Nano ID 字符集" />
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="generateOne">
            生成 Nano ID
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

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel
      v-model="output"
      label="生成结果"
      ariaLabel="Nano ID 生成结果"
      readonly
      placeholder="点击生成 Nano ID"
      min-height-class="min-h-[18rem]"
      empty-message="生成的 Nano ID 会显示在这里，每个占一行。"
    />
  </section>
</template>
