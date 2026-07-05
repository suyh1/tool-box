<script setup lang="ts">
import { Check, Clipboard, GitCompare, RotateCcw, Sparkles, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { createJsonPatchString, createMergePatchString } from './json-patch'

type PatchMode = 'json-patch' | 'merge-patch'

const sampleBefore = JSON.stringify({
  name: 'Ada',
  profile: {
    city: 'London',
    zip: 'E1',
  },
  old: true,
}, null, 2)

const sampleAfter = JSON.stringify({
  name: 'Ada',
  profile: {
    city: 'Paris',
  },
  active: true,
}, null, 2)

const beforeInput = ref('')
const afterInput = ref('')
const output = ref('')
const mode = ref<PatchMode>('json-patch')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)
const modeLabel = computed(() => mode.value === 'json-patch' ? 'JSON Patch' : 'Merge Patch')
const metaLabel = computed(() => output.value ? `${modeLabel.value} 已生成` : '等待对比')

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function runPatch(nextMode = mode.value) {
  resetFeedback()
  mode.value = nextMode

  try {
    output.value = mode.value === 'json-patch'
      ? createJsonPatchString(beforeInput.value, afterInput.value)
      : createMergePatchString(beforeInput.value, afterInput.value)
    liveMessage.value = `${modeLabel.value} 已生成`
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON Patch 生成失败'

    errorMessage.value = message
    liveMessage.value = message
  }
}

function useSample() {
  beforeInput.value = sampleBefore
  afterInput.value = sampleAfter
  output.value = ''
  mode.value = 'json-patch'
  resetFeedback()
  liveMessage.value = 'JSON Patch 示例已载入'
}

function clearAll() {
  beforeInput.value = ''
  afterInput.value = ''
  output.value = ''
  mode.value = 'json-patch'
  resetFeedback()
  liveMessage.value = 'JSON Patch 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = `${modeLabel.value} 已复制`
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="JSON Patch / Merge Patch"
      description="对比两个 JSON 文档，生成 RFC 6902 JSON Patch 或 RFC 7396 Merge Patch。"
      :meta="metaLabel"
    >
      <template #icon>
        <GitCompare class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!beforeInput || !afterInput" @click="runPatch('json-patch')">
            <Sparkles class="h-4 w-4" />
            生成 JSON Patch
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!beforeInput || !afterInput" @click="runPatch('merge-patch')">
            生成 Merge Patch
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
            复制 Patch
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

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel
        v-model="beforeInput"
        label="原始 JSON"
        ariaLabel="JSON Patch 原始输入"
        placeholder='{"name":"Ada"}'
        min-height-class="min-h-[24rem]"
        empty-message="粘贴变更前的 JSON。"
      />

      <ToolTextareaPanel
        v-model="afterInput"
        label="目标 JSON"
        ariaLabel="JSON Patch 目标输入"
        placeholder='{"name":"Ada Lovelace"}'
        min-height-class="min-h-[24rem]"
        empty-message="粘贴变更后的 JSON。"
      />
    </div>

    <ToolTextareaPanel
      v-model="output"
      label="Patch 输出"
      ariaLabel="JSON Patch 输出"
      readonly
      placeholder="生成后显示 patch"
      min-height-class="min-h-[18rem]"
      empty-message="JSON Patch 输出为操作数组，Merge Patch 输出为可合并对象。"
    />
  </section>
</template>
