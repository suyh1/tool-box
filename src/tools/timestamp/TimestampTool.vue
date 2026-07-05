<script setup lang="ts">
import TextTool from '@/tools/_shared/TextTool.vue'
import { dateToUnix, unixToIso } from './timestamp'

const actions = [
  {
    label: 'Unix seconds to ISO',
    run: (input: string) => {
      const result = unixToIso(input, 'seconds')

      return result.ok
        ? {
            ok: true as const,
            value: [
              `ISO: ${result.iso}`,
              `Seconds: ${result.seconds}`,
              `Milliseconds: ${result.milliseconds}`,
            ].join('\n'),
            meta: 'Converted',
          }
        : result
    },
  },
  {
    label: 'Unix ms to ISO',
    run: (input: string) => {
      const result = unixToIso(input, 'milliseconds')

      return result.ok
        ? {
            ok: true as const,
            value: [
              `ISO: ${result.iso}`,
              `Seconds: ${result.seconds}`,
              `Milliseconds: ${result.milliseconds}`,
            ].join('\n'),
            meta: 'Converted',
          }
        : result
    },
  },
  {
    label: 'Date to Unix',
    run: (input: string) => {
      const result = dateToUnix(input)

      return result.ok
        ? {
            ok: true as const,
            value: [
              `Seconds: ${result.seconds}`,
              `Milliseconds: ${result.milliseconds}`,
              `ISO: ${result.iso}`,
            ].join('\n'),
            meta: 'Converted',
          }
        : result
    },
  },
]
</script>

<template>
  <TextTool
    title="Timestamp converter"
    description="Convert Unix timestamps and date strings using the browser runtime."
    input-label="Timestamp or date"
    output-label="Converted value"
    input-aria-label="Timestamp input"
    output-aria-label="Timestamp output"
    placeholder="1970-01-01T00:00:01.000Z"
    sample="1970-01-01T00:00:01.000Z"
    :actions="actions"
  />
</template>
