<script setup lang="ts">
import { Check, Clipboard, FileCheck2, Play, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { validateJsonSchema, type JsonSchemaValidationError } from './json-schema-validate'

const sampleData = JSON.stringify({
  name: 'Ada',
  age: 36,
  role: 'admin',
}, null, 2)

const sampleSchema = JSON.stringify({
  type: 'object',
  required: ['name', 'age', 'role'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 2 },
    age: { type: 'number', minimum: 18 },
    role: { enum: ['admin', 'editor'] },
  },
}, null, 2)

const dataInput = ref('')
const schemaInput = ref('')
const errors = ref<JsonSchemaValidationError[]>([])
const didValidate = ref(false)
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')

const resultLabel = computed(() => {
  if (!didValidate.value) {
    return '等待校验'
  }

  return errors.value.length === 0 ? '校验通过' : `${errors.value.length} 个问题`
})

const reportText = computed(() => errors.value.length === 0
  ? 'JSON Schema 校验通过'
  : errors.value.map((error) => `${error.path}: ${error.message}`).join('\n'))

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function runValidate() {
  resetFeedback()

  try {
    const result = validateJsonSchema(dataInput.value, schemaInput.value)

    errors.value = result.errors
    didValidate.value = true
    liveMessage.value = result.valid ? 'JSON Schema 校验通过' : `发现 ${result.errors.length} 个问题`
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON Schema 校验失败'

    errors.value = []
    didValidate.value = false
    errorMessage.value = message
    liveMessage.value = message
  }
}

function useSample() {
  dataInput.value = sampleData
  schemaInput.value = sampleSchema
  errors.value = []
  didValidate.value = false
  resetFeedback()
  liveMessage.value = 'JSON Schema 示例已载入'
}

function clearAll() {
  dataInput.value = ''
  schemaInput.value = ''
  errors.value = []
  didValidate.value = false
  resetFeedback()
  liveMessage.value = 'JSON Schema 工作区已清空'
}

async function copyReport() {
  if (!didValidate.value) {
    return
  }

  await navigator.clipboard.writeText(reportText.value)
  copied.value = true
  liveMessage.value = '校验报告已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="JSON Schema 校验"
      description="在浏览器本地用常见 JSON Schema 规则校验 JSON 数据，适合快速检查接口样例。"
      :meta="resultLabel"
    >
      <template #icon>
        <FileCheck2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!dataInput || !schemaInput" @click="runValidate">
            <Play class="h-4 w-4" />
            校验
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
          <Button type="button" variant="outline" :disabled="!didValidate" @click="copyReport">
            <Check v-if="copied" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制报告
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
        v-model="dataInput"
        label="JSON 数据"
        ariaLabel="JSON Schema 校验数据输入"
        placeholder='{"name":"Ada","age":36}'
        min-height-class="min-h-[24rem]"
        empty-message="粘贴要校验的 JSON 数据。"
      />

      <ToolTextareaPanel
        v-model="schemaInput"
        label="JSON Schema"
        ariaLabel="JSON Schema 输入"
        placeholder='{"type":"object","properties":{"name":{"type":"string"}}}'
        min-height-class="min-h-[24rem]"
        empty-message="粘贴 JSON Schema。支持 type、required、properties、items、enum 和常见约束。"
      />
    </div>

    <section class="tool-field grid gap-3 rounded-lg border border-border bg-card p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-sm font-medium text-foreground">校验结果</h3>
          <p class="mt-1 text-xs leading-5 text-muted-foreground">错误按 JSON 路径显示，可直接复制报告。</p>
        </div>
        <Badge :variant="didValidate && errors.length === 0 ? 'default' : 'secondary'">
          {{ resultLabel }}
        </Badge>
      </div>

      <div class="min-h-[10rem] overflow-auto rounded-md border border-border bg-background/70 p-3">
        <p v-if="!didValidate" class="text-sm leading-6 text-muted-foreground">
          输入 JSON 数据和 Schema 后点击校验。
        </p>
        <p v-else-if="errors.length === 0" class="text-sm leading-6 text-foreground">
          JSON 数据符合当前 Schema。
        </p>
        <div v-else class="grid gap-2">
          <div
            v-for="error in errors"
            :key="`${error.path}-${error.message}`"
            class="rounded-md border border-border bg-card/80 px-3 py-2"
          >
            <code class="font-mono text-sm text-foreground">{{ error.path }}</code>
            <p class="mt-1 text-sm text-muted-foreground">{{ error.message }}</p>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>
