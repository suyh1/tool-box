<script setup lang="ts">
import { Check, Clipboard, FileText, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { formatKubernetesReport, inspectKubernetesYaml } from './kubernetes-yaml'
import { copyToClipboard } from '@/lib/clipboard'

const sample = `apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: prod
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3`

const input = ref(sample)
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const resourceCount = ref(0)
const warningCount = ref(0)

const canCopy = computed(() => output.value.length > 0)
const meta = computed(() => resourceCount.value > 0 ? `${resourceCount.value} resources` : 'Kubernetes YAML')

function inspect() {
  errorMessage.value = ''
  copied.value = false
  const result = inspectKubernetesYaml(input.value)

  if (!result.ok) {
    output.value = ''
    resourceCount.value = 0
    warningCount.value = 0
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = `${formatKubernetesReport(result)}\n\n${JSON.stringify(result, null, 2)}`
  resourceCount.value = result.resourceCount
  warningCount.value = result.warnings.length
  liveMessage.value = warningCount.value > 0 ? `Kubernetes YAML 已检查，${warningCount.value} 个警告` : 'Kubernetes YAML 已检查'
}

function useSample() {
  input.value = sample
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  resourceCount.value = 0
  warningCount.value = 0
  liveMessage.value = 'Kubernetes YAML 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  resourceCount.value = 0
  warningCount.value = 0
  liveMessage.value = 'Kubernetes YAML 工作区已清空'
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
  liveMessage.value = 'Kubernetes YAML 检查结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Kubernetes YAML 快速检查" description="解析多文档 Kubernetes YAML，检查 apiVersion、kind 和 metadata.name。" :meta="meta">
      <template #icon>
        <FileText class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="inspect">
            检查 YAML
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
      <ToolTextareaPanel v-model="input" label="Kubernetes YAML" ariaLabel="Kubernetes YAML 输入" placeholder="apiVersion: v1" min-height-class="min-h-[28rem]" />
      <ToolTextareaPanel v-model="output" label="检查结果" ariaLabel="Kubernetes YAML 检查结果" readonly placeholder="点击检查 YAML" min-height-class="min-h-[28rem]" empty-message="资源摘要、命名空间和缺失字段警告会显示在这里。" />
    </div>
  </section>
</template>
