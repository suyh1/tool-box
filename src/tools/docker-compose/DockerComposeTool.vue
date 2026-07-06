<script setup lang="ts">
import { Check, Clipboard, FileText, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { formatDockerComposeReport, inspectDockerCompose } from './docker-compose'

const sample = `services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    environment:
      NODE_ENV: production
    depends_on:
      - db
  db:
    image: postgres:16`

const input = ref(sample)
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const serviceCount = ref(0)
const warningCount = ref(0)

const canCopy = computed(() => output.value.length > 0)
const meta = computed(() => serviceCount.value > 0 ? `${serviceCount.value} services` : 'Compose YAML')

function inspect() {
  errorMessage.value = ''
  copied.value = false
  const result = inspectDockerCompose(input.value)

  if (!result.ok) {
    output.value = ''
    serviceCount.value = 0
    warningCount.value = 0
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = `${formatDockerComposeReport(result)}\n\n${JSON.stringify(result, null, 2)}`
  serviceCount.value = result.serviceCount
  warningCount.value = result.warnings.length
  liveMessage.value = warningCount.value > 0 ? `Compose 已检查，${warningCount.value} 个警告` : 'Compose 已检查'
}

function useSample() {
  input.value = sample
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  serviceCount.value = 0
  warningCount.value = 0
  liveMessage.value = 'Docker Compose 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  serviceCount.value = 0
  warningCount.value = 0
  liveMessage.value = 'Docker Compose 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'Docker Compose 检查结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Docker Compose 校验 / 展开" description="检查 Compose services、镜像/build、端口、环境变量和依赖关系。" :meta="meta">
      <template #icon>
        <FileText class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="inspect">
            检查 Compose
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
            复制报告
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="input" label="Compose YAML" ariaLabel="Docker Compose YAML 输入" placeholder="services:" min-height-class="min-h-[28rem]" />
      <ToolTextareaPanel v-model="output" label="检查结果" ariaLabel="Docker Compose 检查结果" readonly placeholder="点击检查 Compose" min-height-class="min-h-[28rem]" empty-message="服务摘要、端口、环境变量数量、依赖关系和警告会显示在这里。" />
    </div>
  </section>
</template>
