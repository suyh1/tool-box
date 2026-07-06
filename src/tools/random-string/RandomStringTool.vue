<script setup lang="ts">
import { Check, Clipboard, Dices, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generateRandomString, type RandomStringPreset } from './random-string'

const length = ref(32)
const preset = ref<RandomStringPreset>('alphanumeric')
const customAlphabet = ref('')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('32 chars')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function generateOne() {
  resetFeedback()
  const result = generateRandomString({
    length: length.value,
    preset: preset.value,
    customAlphabet: customAlphabet.value,
  })

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = `${result.length} chars / ${result.alphabetSize} alphabet`
  liveMessage.value = '随机字符串已生成'
}

function generateBatch() {
  resetFeedback()
  const values: string[] = []

  for (let index = 0; index < 5; index += 1) {
    const result = generateRandomString({
      length: length.value,
      preset: preset.value,
      customAlphabet: customAlphabet.value,
    })

    if (!result.ok) {
      output.value = ''
      errorMessage.value = result.message
      liveMessage.value = result.message
      return
    }

    values.push(result.value)
    meta.value = `${result.length} chars / ${result.alphabetSize} alphabet`
  }

  output.value = values.join('\n')
  liveMessage.value = '已生成 5 个随机字符串'
}

function useSample() {
  length.value = 32
  preset.value = 'base64url'
  customAlphabet.value = ''
  output.value = ''
  resetFeedback()
  meta.value = '32 chars'
  liveMessage.value = '随机字符串示例选项已载入'
}

function clearAll() {
  output.value = ''
  resetFeedback()
  meta.value = `${length.value} chars`
  liveMessage.value = '随机字符串输出已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '随机字符串输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="随机字符串生成器" description="按预设或自定义字符集生成本地随机字符串。" :meta="meta">
      <template #icon>
        <Dices class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 lg:grid-cols-[10rem_12rem_minmax(0,1fr)]">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          长度
          <Input v-model.number="length" type="number" min="1" max="4096" step="1" aria-label="随机字符串长度" />
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          字符集
          <select
            v-model="preset"
            aria-label="随机字符串字符集"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value="alphanumeric">Alphanumeric</option>
            <option value="hex">Hex</option>
            <option value="base64url">Base64URL</option>
            <option value="numeric">Numeric</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          自定义字符集
          <Input v-model="customAlphabet" aria-label="自定义字符集" placeholder="abcdef123456" />
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="generateOne">
            生成字符串
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
      ariaLabel="随机字符串生成结果"
      readonly
      placeholder="点击生成字符串"
      min-height-class="min-h-[18rem]"
      empty-message="生成的随机字符串会显示在这里，每个占一行。"
    />
  </section>
</template>
