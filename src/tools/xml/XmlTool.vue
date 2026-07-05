<script setup lang="ts">
import { Check, Clipboard, CodeXml, RotateCcw, Sparkles, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { formatXml, minifyXml, validateXml } from './xml'

const sampleXml = '<root><item id="1">Ada</item><empty /></root>'

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const isValid = ref<boolean | null>(null)

const canCopy = computed(() => output.value.length > 0)
const metaLabel = computed(() => {
  if (isValid.value === null) {
    return '等待 XML'
  }

  return isValid.value ? 'XML 有效' : 'XML 无效'
})

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function applyXml(action: 'format' | 'minify' | 'validate') {
  resetFeedback()

  try {
    if (action === 'format') {
      output.value = formatXml(input.value)
      isValid.value = true
      liveMessage.value = 'XML 已格式化'
      return
    }

    if (action === 'minify') {
      output.value = minifyXml(input.value)
      isValid.value = true
      liveMessage.value = 'XML 已压缩'
      return
    }

    const result = validateXml(input.value)
    isValid.value = result.ok
    output.value = result.ok ? input.value : ''
    errorMessage.value = result.ok ? '' : result.message
    liveMessage.value = result.ok ? 'XML 校验通过' : result.message
  } catch (error) {
    const message = error instanceof Error ? error.message : 'XML 处理失败'

    output.value = ''
    isValid.value = false
    errorMessage.value = message
    liveMessage.value = message
  }
}

function useSample() {
  input.value = sampleXml
  output.value = ''
  isValid.value = null
  resetFeedback()
  liveMessage.value = 'XML 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  isValid.value = null
  resetFeedback()
  liveMessage.value = 'XML 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'XML 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="XML 格式化 / 压缩"
      description="格式化、压缩并校验 XML 片段。解析和处理都在浏览器中完成。"
      :meta="metaLabel"
    >
      <template #icon>
        <CodeXml class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="applyXml('format')">
            <Sparkles class="h-4 w-4" />
            格式化 XML
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input" @click="applyXml('minify')">
            压缩 XML
          </Button>
          <Button type="button" variant="outline" :disabled="!input" @click="applyXml('validate')">
            校验 XML
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

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel
        v-model="input"
        label="输入"
        ariaLabel="XML 输入"
        placeholder="<root><item>Ada</item></root>"
        min-height-class="min-h-[28rem]"
        empty-message="粘贴 XML 片段或完整文档。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="XML 输出"
        readonly
        placeholder="执行 XML 操作后查看输出"
        min-height-class="min-h-[28rem]"
        empty-message="格式化或压缩后，结果会显示在这里。"
      />
    </div>
  </section>
</template>
