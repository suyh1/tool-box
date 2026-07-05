<script setup lang="ts">
import TextTool from '@/tools/_shared/TextTool.vue'
import { dateToUnix, unixToIso } from './timestamp'

const actions = [
  {
    label: 'Unix 秒转 ISO',
    run: (input: string) => {
      const result = unixToIso(input, 'seconds')

      return result.ok
        ? {
            ok: true as const,
            value: [
              `ISO 时间: ${result.iso}`,
              `秒: ${result.seconds}`,
              `毫秒: ${result.milliseconds}`,
            ].join('\n'),
            meta: '转换完成',
          }
        : result
    },
  },
  {
    label: 'Unix 毫秒转 ISO',
    run: (input: string) => {
      const result = unixToIso(input, 'milliseconds')

      return result.ok
        ? {
            ok: true as const,
            value: [
              `ISO 时间: ${result.iso}`,
              `秒: ${result.seconds}`,
              `毫秒: ${result.milliseconds}`,
            ].join('\n'),
            meta: '转换完成',
          }
        : result
    },
  },
  {
    label: '日期转 Unix',
    run: (input: string) => {
      const result = dateToUnix(input)

      return result.ok
        ? {
            ok: true as const,
            value: [
              `秒: ${result.seconds}`,
              `毫秒: ${result.milliseconds}`,
              `ISO 时间: ${result.iso}`,
            ].join('\n'),
            meta: '转换完成',
          }
        : result
    },
  },
]
</script>

<template>
  <TextTool
    title="时间戳转换"
    description="使用浏览器运行时转换 Unix 时间戳和日期字符串。"
    input-label="时间戳或日期"
    output-label="转换结果"
    input-aria-label="时间戳输入"
    output-aria-label="时间戳输出"
    placeholder="1970-01-01T00:00:01.000Z"
    sample="1970-01-01T00:00:01.000Z"
    :actions="actions"
  />
</template>
