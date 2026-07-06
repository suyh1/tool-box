<script setup lang="ts">
import { Check, Clipboard, GitCompare, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { analyzeSemver, compareSemver } from './semver'

const version = ref('1.4.0')
const compareTo = ref('1.2.3')
const range = ref('^1.2.3')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('Release')

const canCopy = computed(() => output.value.length > 0)

function comparisonLabel(result: number): string {
  if (result > 0) return 'greater'
  if (result < 0) return 'less'
  return 'equal'
}

function analyze() {
  errorMessage.value = ''
  copied.value = false

  try {
    const analysis = analyzeSemver(version.value, range.value.trim() || '*')

    if (!analysis.ok) {
      output.value = ''
      errorMessage.value = analysis.message
      liveMessage.value = analysis.message
      return
    }

    const payload: Record<string, unknown> = {
      version: analysis.version,
    }

    if (compareTo.value.trim()) {
      const comparison = compareSemver(version.value, compareTo.value)
      payload.comparison = {
        target: compareTo.value.trim(),
        result: comparison,
        label: comparisonLabel(comparison),
      }
    }

    if (range.value.trim()) {
      payload.range = {
        expression: range.value.trim(),
        satisfies: analysis.satisfies,
      }
    }

    output.value = JSON.stringify(payload, null, 2)
    meta.value = range.value.trim() ? (analysis.satisfies ? 'Range match' : 'Range miss') : 'Compared'
    liveMessage.value = 'SemVer 已分析'
  } catch (error) {
    output.value = ''
    errorMessage.value = error instanceof Error ? error.message : 'SemVer 分析失败'
    liveMessage.value = errorMessage.value
  }
}

function useSample() {
  version.value = '1.4.0'
  compareTo.value = '1.2.3'
  range.value = '^1.2.3'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'Release'
  liveMessage.value = 'SemVer 示例已载入'
}

function clearAll() {
  version.value = ''
  compareTo.value = ''
  range.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'Release'
  liveMessage.value = 'SemVer 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'SemVer 结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="SemVer 比较器" description="比较语义化版本，并检查常见精确、比较符、caret 和 tilde 范围。" :meta="meta">
      <template #icon>
        <GitCompare class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-3 md:grid-cols-3">
        <label class="grid gap-2 text-sm font-medium text-foreground">
          版本
          <Input v-model="version" aria-label="SemVer 版本" placeholder="1.4.0" />
        </label>
        <label class="grid gap-2 text-sm font-medium text-foreground">
          比较对象
          <Input v-model="compareTo" aria-label="SemVer 比较对象" placeholder="1.2.3" />
        </label>
        <label class="grid gap-2 text-sm font-medium text-foreground">
          范围
          <Input v-model="range" aria-label="SemVer 范围" placeholder="^1.2.3" />
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!version" @click="analyze">
            <GitCompare class="h-4 w-4" />
            分析版本
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

    <ToolTextareaPanel v-model="output" label="分析结果" ariaLabel="SemVer 分析结果" readonly placeholder="点击分析版本" min-height-class="min-h-[22rem]" empty-message="比较结果和范围匹配结果会显示在这里。" />
  </section>
</template>
