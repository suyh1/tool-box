<script setup lang="ts">
import { Check, Clipboard, ListFilter, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { convertDelimiter, type DelimiterKind } from './delimiter-convert'

const input = ref('alpha\n beta\n\n gamma')
const output = ref('')
const from = ref<DelimiterKind>('newline')
const to = ref<DelimiterKind>('comma')
const customFrom = ref('|')
const customTo = ref(' :: ')
const trimItems = ref(true)
const removeEmpty = ref(true)
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('delimiter')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  copied.value = false
}

function run() {
  resetFeedback()
  const result = convertDelimiter(input.value, {
    from: from.value,
    to: to.value,
    customFrom: customFrom.value,
    customTo: customTo.value,
    trimItems: trimItems.value,
    removeEmpty: removeEmpty.value,
  })

  output.value = result.output
  meta.value = `${result.stats.outputItems} items`
  liveMessage.value = `已转换 ${result.stats.outputItems} 项`
}

function useSample() {
  input.value = 'alpha\n beta\n\n gamma'
  output.value = ''
  from.value = 'newline'
  to.value = 'comma'
  customFrom.value = '|'
  customTo.value = ' :: '
  trimItems.value = true
  removeEmpty.value = true
  resetFeedback()
  meta.value = 'delimiter'
  liveMessage.value = '分隔符转换示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'delimiter'
  liveMessage.value = '分隔符转换工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '分隔符转换结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="分隔符转换" description="在换行、逗号、Tab、空格和自定义分隔符之间转换列表。" :meta="meta">
      <template #icon>
        <ListFilter class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 lg:grid-cols-4">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          来源
          <select v-model="from" aria-label="来源分隔符" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="newline">换行</option>
            <option value="comma">逗号</option>
            <option value="tab">Tab</option>
            <option value="space">空白</option>
            <option value="custom">自定义</option>
          </select>
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          目标
          <select v-model="to" aria-label="目标分隔符" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="newline">换行</option>
            <option value="comma">逗号</option>
            <option value="tab">Tab</option>
            <option value="space">空格</option>
            <option value="custom">自定义</option>
          </select>
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          自定义来源
          <Input v-model="customFrom" aria-label="自定义来源分隔符" />
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          自定义目标
          <Input v-model="customTo" aria-label="自定义目标分隔符" />
        </label>
      </div>

      <div class="mt-4 flex flex-wrap gap-3">
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
            转换分隔符
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
      <ToolTextareaPanel v-model="input" label="输入列表" ariaLabel="分隔符转换输入" placeholder="粘贴列表" min-height-class="min-h-[22rem]" />
      <ToolTextareaPanel v-model="output" label="转换结果" ariaLabel="分隔符转换输出" readonly placeholder="点击转换分隔符" min-height-class="min-h-[22rem]" empty-message="转换后的列表会显示在这里。" />
    </div>
  </section>
</template>
