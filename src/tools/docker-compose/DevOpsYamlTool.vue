<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import KubernetesYamlTool from '@/tools/kubernetes-yaml/KubernetesYamlTool.vue'
import DockerComposeTool from './DockerComposeTool.vue'

const items = [
  {
    id: 'compose',
    label: 'Compose',
    description: '校验并展开 Docker Compose YAML。',
    component: DockerComposeTool,
  },
  {
    id: 'kubernetes',
    label: 'Kubernetes',
    description: '快速检查 Kubernetes YAML。',
    component: KubernetesYamlTool,
  },
]
</script>

<template>
  <ToolSuite
    title="DevOps YAML 工具"
    description="合并 Docker Compose 和 Kubernetes YAML 快速检查。"
    :items="items"
  />
</template>
