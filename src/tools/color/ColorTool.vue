<script setup lang="ts">
import { Check, Clipboard, Palette, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { convertColor } from './color'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('#336699')
const pickerValue = ref('#336699')
const output = ref('')
const swatch = ref('#336699')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('HEX / RGB / HSL / OKLCH')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function convert() {
  resetFeedback()
  const result = convertColor(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  swatch.value = result.hex
  pickerValue.value = result.hex
  meta.value = result.hex
  liveMessage.value = '颜色已转换'
}

function usePickerValue() {
  input.value = pickerValue.value
  convert()
}

function useSample() {
  input.value = '#336699'
  pickerValue.value = '#336699'
  output.value = ''
  swatch.value = '#336699'
  resetFeedback()
  meta.value = 'HEX / RGB / HSL / OKLCH'
  liveMessage.value = '颜色示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'HEX / RGB / HSL / OKLCH'
  liveMessage.value = '颜色转换工作区已清空'
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
  liveMessage.value = '颜色转换输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Color Picker / 转换" description="在 HEX、RGB、HSL 和 OKLCH 之间转换颜色。" :meta="meta">
      <template #icon>
        <Palette class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 lg:grid-cols-[6rem_minmax(0,1fr)_10rem]">
        <div class="h-16 rounded-md border border-border" :style="{ backgroundColor: swatch }" aria-label="颜色预览" />
        <Input v-model="input" aria-label="颜色输入" placeholder="#336699, rgb(51 102 153), hsl(210 50% 40%)" />
        <input v-model="pickerValue" type="color" class="h-10 w-full rounded-md border border-border bg-background p-1" aria-label="颜色选择器" @input="usePickerValue">
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="convert">
            转换颜色
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
      label="转换结果"
      ariaLabel="颜色转换结果"
      readonly
      placeholder="点击转换颜色"
      min-height-class="min-h-[22rem]"
      empty-message="HEX、RGB、HSL、OKLCH 和 CSS 写法会显示在这里。"
    />
  </section>
</template>
