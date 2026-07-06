<script setup lang="ts">
import { Check, Clipboard, Dices, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { randomizeList, type ListRandomMode } from './list-random'

const input = ref('alpha\n beta\n\ngamma\ndelta')
const output = ref('')
const mode = ref<ListRandomMode>('shuffle')
const sampleSize = ref(2)
const seed = ref('toolbox')
const trimItems = ref(true)
const removeEmpty = ref(true)
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('shuffle / sample')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  copied.value = false
}

function run() {
  resetFeedback()
  const result = randomizeList(input.value, {
    mode: mode.value,
    sampleSize: sampleSize.value,
    seed: seed.value,
    trimItems: trimItems.value,
    removeEmpty: removeEmpty.value,
  })

  output.value = result.output
  meta.value = `${result.stats.outputItems} items`
  liveMessage.value = `已输出 ${result.stats.outputItems} 项`
}

function useSample() {
  input.value = 'alpha\n beta\n\ngamma\ndelta'
  output.value = ''
  mode.value = 'shuffle'
  sampleSize.value = 2
  seed.value = 'toolbox'
  trimItems.value = true
  removeEmpty.value = true
  resetFeedback()
  meta.value = 'shuffle / sample'
  liveMessage.value = '列表随机化示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'shuffle / sample'
  liveMessage.value = '列表随机化工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '列表随机化结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="列表随机化 / 抽样" description="对多行列表洗牌，或按样本数量抽取随机子集；可用 seed 复现结果。" :meta="meta">
      <template #icon>
        <Dices class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 lg:grid-cols-[10rem_8rem_minmax(0,1fr)_repeat(2,minmax(0,1fr))]">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          模式
          <select v-model="mode" aria-label="随机化模式" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="shuffle">洗牌</option>
            <option value="sample">抽样</option>
          </select>
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          样本数
          <Input v-model.number="sampleSize" type="number" min="0" step="1" aria-label="样本数量" />
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          Seed
          <Input v-model="seed" aria-label="随机 seed" placeholder="可留空" />
        </label>
        <label class="flex items-center gap-2 rounded-md border border-border bg-background/55 px-3 py-2 text-sm text-foreground">
          <input v-model="trimItems" type="checkbox" class="h-4 w-4 accent-primary">
          修剪空白
        </label>
        <label class="flex items-center gap-2 rounded-md border border-border bg-background/55 px-3 py-2 text-sm text-foreground">
          <input v-model="removeEmpty" type="checkbox" class="h-4 w-4 accent-primary">
          去空项
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="run">
            随机化列表
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
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="input" label="输入列表" ariaLabel="列表随机化输入" placeholder="每行一个值" min-height-class="min-h-[22rem]" />
      <ToolTextareaPanel v-model="output" label="随机化结果" ariaLabel="列表随机化输出" readonly placeholder="点击随机化列表" min-height-class="min-h-[22rem]" empty-message="洗牌或抽样后的结果会显示在这里。" />
    </div>
  </section>
</template>
