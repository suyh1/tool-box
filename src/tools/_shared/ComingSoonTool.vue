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
          Planned tool
        </Badge>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          {{ tool?.title ?? 'Tool not found' }}
        </h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {{ tool?.description ?? 'This tool is not registered yet.' }}
        </p>
      </div>
    </div>

    <div class="mt-6 rounded-lg border border-dashed border-border bg-secondary/45 p-4">
      <p class="text-sm text-muted-foreground">
        This slot is reserved in the toolbox registry. The implementation will use the same input, output, copy,
        sample, clear, and error-state vocabulary as the active tools.
      </p>
    </div>
  </section>
</template>
