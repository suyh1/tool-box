<script setup lang="ts">
import { Check, Clipboard, Languages, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { convertToPinyin } from './pinyin'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('工具箱 重庆')
const output = ref('')
const separator = ref(' ')
const keepUnknown = ref(true)
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('local map')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  copied.value = false
}

function run() {
  resetFeedback()
  const result = convertToPinyin(input.value, {
    separator: separator.value,
    keepUnknown: keepUnknown.value,
  })

  output.value = result.text
  meta.value = result.unknownCharacters.length === 0 ? 'all mapped' : `${result.unknownCharacters.length} unknown`
  liveMessage.value = '拼音转换已完成'
}

function useSample() {
  input.value = '工具箱 重庆'
  output.value = ''
  separator.value = ' '
  keepUnknown.value = true
  resetFeedback()
  meta.value = 'local map'
  liveMessage.value = '拼音转换示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'local map'
  liveMessage.value = '拼音转换工作区已清空'
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
  liveMessage.value = '拼音结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="拼音转换" description="使用内置常用汉字映射把中文文本转换为拼音，适合本地快速命名辅助。" :meta="meta">
      <template #icon>
        <Languages class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          分隔符
          <Input v-model="separator" aria-label="拼音分隔符" placeholder="空格、-、_" />
        </label>
        <label class="flex items-center gap-2 rounded-md border border-border bg-background/55 px-3 py-2 text-sm text-foreground">
          <input v-model="keepUnknown" type="checkbox" class="h-4 w-4 accent-primary">
          保留未知字符
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="run">
            转换拼音
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
            复制拼音
          </Button>
        </template>
      </ToolActionBar>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="input" label="输入中文" ariaLabel="拼音转换输入" placeholder="粘贴中文文本" min-height-class="min-h-[18rem]" />
      <ToolTextareaPanel v-model="output" label="拼音结果" ariaLabel="拼音转换输出" readonly placeholder="点击转换拼音" min-height-class="min-h-[18rem]" empty-message="拼音转换结果会显示在这里。" />
    </div>
  </section>
</template>
