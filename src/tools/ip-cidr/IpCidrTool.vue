<script setup lang="ts">
import { Check, Clipboard, Network, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { calculateIpv4Cidr } from './ip-cidr'

const input = ref('192.168.1.10/24')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('IPv4 subnet')

const canCopy = computed(() => output.value.length > 0)

function calculate() {
  errorMessage.value = ''
  copied.value = false
  const result = calculateIpv4Cidr(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.prefix} / ${result.totalAddresses} addresses`
  liveMessage.value = 'CIDR 已计算'
}

function useSample() {
  input.value = '192.168.1.10/24'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'IPv4 subnet'
  liveMessage.value = 'CIDR 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'IPv4 subnet'
  liveMessage.value = 'CIDR 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'CIDR 结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="IP / CIDR 计算器" description="计算 IPv4 CIDR 的网络地址、广播地址、主机范围、netmask 和 wildcard mask。" :meta="meta">
      <template #icon>
        <Network class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4">
        <Input v-model="input" aria-label="IPv4 CIDR" placeholder="192.168.1.10/24" />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="calculate">
            计算 CIDR
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="ghost" @click="useSample">
            <RotateCcw class="h-4 w-4" />
            示例
          </Button>
          <Button type="button" variant="ghost" @click="clearAll">
            <Trash2 class="h-4 w-4" />
            清空
          </Button>
          <Button type="button" variant="outline" :disabled="!canCopy" @click="copyOutput">
            <Check v-if="copied" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制 JSON
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel v-model="output" label="计算结果" ariaLabel="CIDR 计算结果" readonly placeholder="点击计算 CIDR" min-height-class="min-h-[22rem]" empty-message="网络地址、广播地址和主机范围会显示在这里。" />
  </section>
</template>
