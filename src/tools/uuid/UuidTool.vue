<script setup lang="ts">
import TextTool from '@/tools/_shared/TextTool.vue'
import { generateUuids } from './uuid'

const actions = [
  {
    label: 'Generate UUID',
    run: () => ({
      ok: true as const,
      value: generateUuids(1).join('\n'),
      meta: 'Generated',
    }),
  },
  {
    label: 'Generate 10',
    run: () => ({
      ok: true as const,
      value: generateUuids(10).join('\n'),
      meta: 'Generated 10',
    }),
  },
]
</script>

<template>
  <TextTool
    title="UUID generator"
    description="Generate browser-native UUID v4 values for IDs, fixtures, and request tracing."
    input-label="Options"
    output-label="Generated UUIDs"
    input-aria-label="UUID input"
    output-aria-label="UUID output"
    placeholder="Input is optional"
    sample=""
    :actions="actions"
  />
</template>
