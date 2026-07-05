<script setup lang="ts">
import TextTool from '@/tools/_shared/TextTool.vue'
import { decodeBase64, encodeBase64 } from './base64'

const actions = [
  {
    label: 'Encode Base64',
    run: (input: string) => ({
      ok: true as const,
      value: encodeBase64(input),
      meta: 'Encoded',
    }),
  },
  {
    label: 'Decode Base64',
    run: (input: string) => {
      const result = decodeBase64(input)

      return result.ok
        ? { ok: true as const, value: result.value, meta: 'Decoded' }
        : result
    },
  },
]
</script>

<template>
  <TextTool
    title="Base64 codec"
    description="Encode and decode UTF-8 text without sending content outside the browser."
    input-label="Input"
    output-label="Output"
    input-aria-label="Base64 input"
    output-aria-label="Base64 output"
    placeholder="hello"
    sample="hello"
    :actions="actions"
  />
</template>
