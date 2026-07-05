<script setup lang="ts">
import { Badge } from '@/components/ui/badge'

defineProps<{
  title: string
  description: string
  meta?: string
}>()
</script>

<template>
  <section class="tool-panel rounded-lg border border-border bg-card p-4 md:p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <slot name="icon" />
          <h2 class="text-base font-semibold text-foreground">{{ title }}</h2>
        </div>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{{ description }}</p>
      </div>
      <Badge v-if="meta" variant="secondary">{{ meta }}</Badge>
    </div>
    <slot />
  </section>
</template>
