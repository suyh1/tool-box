<script setup lang="ts">
import { Check, Clipboard, RotateCcw, ShieldCheck, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { parseX509Certificate } from './x509-cert'
import { copyToClipboard } from '@/lib/clipboard'

const sampleCertificate = `-----BEGIN CERTIFICATE-----
MIIDNDCCAhygAwIBAgIJANX0kt1+HovuMA0GCSqGSIb3DQEBCwUAMEExFjAUBgNV
BAMMDXRvb2xib3gubG9jYWwxGjAYBgNVBAoMEURldmVsb3BlciBUb29sYm94MQsw
CQYDVQQGEwJVUzAeFw0yNjA3MDYxMjQzMzlaFw0yNzA3MDYxMjQzMzlaMEExFjAU
BgNVBAMMDXRvb2xib3gubG9jYWwxGjAYBgNVBAoMEURldmVsb3BlciBUb29sYm94
MQswCQYDVQQGEwJVUzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKlm
Y9KcHHeEVxklffcWelFr1/5gaaHnwCTtK4r8DNtG2bKQCW9a5SiQfi+6VNoGQNnb
1HHBxpou1FJ+U+0vGHYNlA5BQMm530r6Kqmnp2O3iV8tFZAIsYowHtKmro+HqFQ7
GYRrsXt4ZO79c/M6hJm3jnZHZpcqbBkFojlgJuSUX7Qrze39d39b2fJbhh7XPacP
sWgH8ceK0PR3Q7BKfZkLKsbXJQ5c+V4jEHLnNbDijz4ZY5Um32kgAfO9tYo5ML7M
taPkSmxAsOjYfjDt1kz+iizkLXVFKYyYZWWzEYM0D6YP5CaYaSAlUUCdvesHgLs+
KSNd/3nG7aLpaK+pulcCAwEAAaMvMC0wKwYDVR0RBCQwIoINdG9vbGJveC5sb2Nh
bIIRd3d3LnRvb2xib3gubG9jYWwwDQYJKoZIhvcNAQELBQADggEBAAvvjcpVgtLX
iE8L3OybVXDb3ZkgovZaPQIasA/K47EnuCvO68yqdNjrMmjVd3l9GOawYc2nxN+f
Sy5Xa+LnVSlygFIZ6fcDMIXGrgmBb6iBQup69nHovK7sa48BnYbtvFaRG02/muUK
LSEbFHVYpzvCqDlDB7SMS395ivu3aKiOH+QGs1SvtYFV2v6GBsOhO4FigaqWF0zx
Y5z53ox8JTZhiBhkYyKhqrm9sKr1NlRHgINwvR0qEdPYSgrOtMGTqAD6xbgEDurs
SZjSs8T9wvpp5EJ08deLJGjai3YVRBVd0ap6lYpAvr4b1gLah+63YsJ26/mEaCiN
YOABgFgaaYw=
-----END CERTIFICATE-----`

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('PEM')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function parseCertificate() {
  resetFeedback()
  const result = parseX509Certificate(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.publicKeyAlgorithm} / ${result.dnsNames.length} SAN`
  liveMessage.value = 'X.509 证书已解析'
}

function useSample() {
  input.value = sampleCertificate
  output.value = ''
  resetFeedback()
  meta.value = '示例已载入'
  liveMessage.value = 'X.509 证书示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'PEM'
  liveMessage.value = 'X.509 证书工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  const clipboardResult = await copyToClipboard(output.value)
  if (!clipboardResult.ok) {
    liveMessage.value = clipboardResult.message
    return
  }
  copied.value = true
  liveMessage.value = 'X.509 证书输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="X.509 证书解析"
      description="本地解析 PEM 证书的主体、签发者、有效期、公钥算法和 SAN 域名。"
      :meta="meta"
    >
      <template #icon>
        <ShieldCheck class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="parseCertificate">
            解析证书
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
            复制输出
          </Button>
        </template>
      </ToolActionBar>

      <p
        v-if="errorMessage"
        role="alert"
        class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel
        v-model="input"
        label="证书 PEM"
        ariaLabel="X.509 证书输入"
        placeholder="-----BEGIN CERTIFICATE-----"
        min-height-class="min-h-[32rem]"
        empty-message="粘贴 PEM 格式证书以解析 TLS 元数据。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="解析结果"
        ariaLabel="X.509 证书解析结果"
        readonly
        placeholder="解析后查看 JSON 元数据"
        min-height-class="min-h-[32rem]"
        empty-message="证书主体、签发者、有效期和 SAN 域名会显示在这里。"
      />
    </div>
  </section>
</template>
