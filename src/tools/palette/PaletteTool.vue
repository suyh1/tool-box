<script setup lang="ts">
import { Check, Clipboard, Palette, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generatePalette, type PaletteColor } from './palette'

const input = ref('#336699')
const pickerValue = ref('#336699')
const colors = ref<PaletteColor[]>([])
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('Color harmony')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function generate() {
  resetFeedback()
  const result = generatePalette(input.value)

  if (!result.ok) {
    colors.value = []
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  colors.value = result.colors
  pickerValue.value = result.base
  output.value = JSON.stringify(result.colors, null, 2)
  meta.value = `${result.colors.length} colors`
  liveMessage.value = '调色板已生成'
}

function usePickerValue() {
  input.value = pickerValue.value
  generate()
}

function useSample() {
  input.value = '#336699'
  pickerValue.value = '#336699'
  colors.value = []
  output.value = ''
  resetFeedback()
  meta.value = 'Color harmony'
  liveMessage.value = '调色板示例已载入'
}

function clearAll() {
  input.value = ''
  colors.value = []
  output.value = ''
  resetFeedback()
  meta.value = 'Color harmony'
  liveMessage.value = '调色板工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '调色板 JSON 已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="调色板生成" description="从一个基础颜色生成互补色、邻近色、三角色、浅色和深色。" :meta="meta">
      <template #icon>
        <Palette class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem]">
        <Input v-model="input" aria-label="基础颜色" placeholder="#336699, rgb(51 102 153), hsl(210 50% 40%)" />
        <input v-model="pickerValue" type="color" class="h-10 w-full rounded-md border border-border bg-background p-1" aria-label="颜色选择器" @input="usePickerValue">
      </div>

      <div v-if="colors.length" class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div v-for="color in colors" :key="color.name" class="overflow-hidden rounded-lg border border-border bg-background/55">
          <div class="h-16 border-b border-border" :style="{ backgroundColor: color.hex }" />
          <div class="grid gap-1 p-3">
            <span class="text-sm font-medium text-foreground">{{ color.name }}</span>
            <span class="font-mono text-xs text-muted-foreground">{{ color.hex }}</span>
          </div>
        </div>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="generate">
            生成调色板
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
            复制 JSON
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel
      v-model="output"
      label="调色板 JSON"
      ariaLabel="调色板 JSON"
      readonly
      placeholder="点击生成调色板"
      min-height-class="min-h-[18rem]"
      empty-message="生成的颜色名称、HEX、RGB 和 HSL 会显示在这里。"
    />
  </section>
</template>
