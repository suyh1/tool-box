<script setup lang="ts">
import { Check, Clipboard, Contrast, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { checkContrast } from './contrast'

const foreground = ref('#111827')
const background = ref('#ffffff')
const foregroundPicker = ref('#111827')
const backgroundPicker = ref('#ffffff')
const output = ref('')
const ratio = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('WCAG AA / AAA')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function runCheck() {
  resetFeedback()
  const result = checkContrast(foreground.value, background.value)

  if (!result.ok) {
    output.value = ''
    ratio.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  foregroundPicker.value = result.foreground.hex
  backgroundPicker.value = result.background.hex
  ratio.value = `${result.ratio}:1`
  meta.value = result.normalText.aa ? 'Normal AA pass' : 'Normal AA fail'
  output.value = JSON.stringify(result, null, 2)
  liveMessage.value = '对比度已检查'
}

function usePickers() {
  foreground.value = foregroundPicker.value
  background.value = backgroundPicker.value
  runCheck()
}

function useSample() {
  foreground.value = '#111827'
  background.value = '#ffffff'
  foregroundPicker.value = '#111827'
  backgroundPicker.value = '#ffffff'
  output.value = ''
  ratio.value = ''
  resetFeedback()
  meta.value = 'WCAG AA / AAA'
  liveMessage.value = '对比度示例已载入'
}

function clearAll() {
  foreground.value = ''
  background.value = ''
  output.value = ''
  ratio.value = ''
  resetFeedback()
  meta.value = 'WCAG AA / AAA'
  liveMessage.value = '对比度工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '对比度结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="对比度检查器" description="计算前景色和背景色的 WCAG 对比度，并标记 AA / AAA 通过情况。" :meta="meta">
      <template #icon>
        <Contrast class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 lg:grid-cols-2">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          前景色
          <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_6rem]">
            <Input v-model="foreground" aria-label="前景色" placeholder="#111827" />
            <input v-model="foregroundPicker" type="color" class="h-10 w-full rounded-md border border-border bg-background p-1" aria-label="前景色选择器" @input="usePickers">
          </div>
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          背景色
          <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_6rem]">
            <Input v-model="background" aria-label="背景色" placeholder="#ffffff" />
            <input v-model="backgroundPicker" type="color" class="h-10 w-full rounded-md border border-border bg-background p-1" aria-label="背景色选择器" @input="usePickers">
          </div>
        </label>
      </div>

      <div class="mt-4 rounded-lg border border-border bg-background/55 p-4" :style="{ color: foregroundPicker, backgroundColor: backgroundPicker }">
        <div class="text-sm font-medium">Preview text</div>
        <div class="mt-2 text-2xl font-semibold">Contrast {{ ratio || 'not checked' }}</div>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!foreground || !background" @click="runCheck">
            检查对比度
          </Button>
        </template>

        <template #secondary>
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
            复制结果
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel
      v-model="output"
      label="检查结果"
      ariaLabel="对比度检查结果"
      readonly
      placeholder="点击检查对比度"
      min-height-class="min-h-[18rem]"
      empty-message="对比度、相对亮度和 WCAG 通过情况会显示在这里。"
    />
  </section>
</template>
