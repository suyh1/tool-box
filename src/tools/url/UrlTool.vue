<script setup lang="ts">
import TextTool from '@/tools/_shared/TextTool.vue'
import { decodeUrlComponent, encodeUrlComponent } from './url'

const actions = [
  {
    label: 'Encode URL',
    run: (input: string) => ({
      ok: true as const,
      value: encodeUrlComponent(input),
      meta: 'Encoded',
    }),
  },
  {
    label: 'Decode URL',
    run: (input: string) => {
      const result = decodeUrlComponent(input)

      return result.ok
        ? { ok: true as const, value: result.value, meta: 'Decoded' }
        : result
    },
  },
]
</script>

<template>
  <TextTool
    title="URL codec"
    description="Encode and decode URL components for query strings, paths, and payload snippets."
    input-label="Input"
    output-label="Output"
    input-aria-label="URL input"
    output-aria-label="URL output"
    placeholder="a b+c"
    sample="a b+c"
    :actions="actions"
  />
</template>
