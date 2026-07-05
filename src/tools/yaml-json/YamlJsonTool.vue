<script setup lang="ts">
import { Check, Clipboard, Code2, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { jsonToYaml, yamlToJson } from './yaml-json'

const sampleJson = JSON.stringify({
  name: 'Toolbox',
  enabled: true,
  ports: [3000, 4174],
}, null, 2)

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const meta = ref('等待输入')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)

function runConversion(direction: 'json-to-yaml' | 'yaml-to-json') {
  errorMessage.value = ''
  copied.value = false

  const result = direction === 'json-to-yaml'
    ? jsonToYaml(input.value)
    : yamlToJson(input.value)

  if (!result.ok) {
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = result.meta
  liveMessage.value = result.meta
}

function useSample() {
  input.value = sampleJson
  output.value = ''
  errorMessage.value = ''
  meta.value = '示例已载入'
  copied.value = false
  liveMessage.value = 'YAML JSON 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  meta.value = '等待输入'
  copied.value = false
  liveMessage.value = 'YAML JSON 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '转换输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="YAML / JSON 转换"
      description="在 JSON 和 YAML 之间转换配置片段，解析和输出都在浏览器中完成。"
      :meta="meta"
    >
      <template #icon>
        <Code2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="runConversion('json-to-yaml')">
            JSON 转 YAML
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" @click="runConversion('yaml-to-json')">
            YAML 转 JSON
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
        ariaLabel="YAML JSON 输入"
        placeholder='{"name":"Toolbox"}'
        empty-message="粘贴 JSON 或 YAML。转换过程不会离开浏览器。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="YAML JSON 输出"
        readonly
        placeholder="执行转换后查看输出"
        empty-message="转换结果会显示在这里。"
      />
    </div>
  </section>
</template>
