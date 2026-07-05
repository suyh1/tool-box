<script setup lang="ts">
import TextTool from '@/tools/_shared/TextTool.vue'
import { decodeJwt } from './jwt'

const sampleToken = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRvb2xib3giLCJhZG1pbiI6dHJ1ZX0',
  'signature',
].join('.')

const actions = [
  {
    label: 'Decode JWT',
    run: (input: string) => {
      const result = decodeJwt(input)

      return result.ok
        ? {
            ok: true as const,
            value: [
              'Signature status: not verified',
              '',
              'Header',
              JSON.stringify(result.header, null, 2),
              '',
              'Payload',
              JSON.stringify(result.payload, null, 2),
              '',
              `Signature: ${result.signature}`,
            ].join('\n'),
            meta: 'Decoded, not verified',
          }
        : result
    },
  },
]
</script>

<template>
  <TextTool
    title="JWT decoder"
    description="Decode JWT header and payload locally. This tool does not verify signatures."
    input-label="JWT"
    output-label="Decoded token"
    input-aria-label="JWT input"
    output-aria-label="JWT output"
    placeholder="header.payload.signature"
    :sample="sampleToken"
    :actions="actions"
  />
</template>
