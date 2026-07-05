<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { getToolById } from '@/tools/registry'

const route = useRoute()
const tool = computed(() => getToolById(String(route.meta.toolId ?? route.params.toolId)))
</script>

<template>
  <section class="rounded-lg border border-border bg-card p-5 md:p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <Badge variant="secondary" class="mb-3">
          规划中的工具
        </Badge>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          {{ tool?.title ?? '未找到工具' }}
        </h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {{ tool?.description ?? '这个工具尚未注册。' }}
        </p>
      </div>
    </div>

    <div class="mt-6 rounded-lg border border-dashed border-border bg-secondary/45 p-4">
      <p class="text-sm text-muted-foreground">
        这个位置已在工具注册表中预留。后续实现会沿用现有工具的输入、输出、复制、示例、清空和错误状态文案。
      </p>
    </div>
  </section>
</template>
