<script setup lang="ts">
import { Link2, ShieldCheck } from '@lucide/vue'
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { getToolPrivacyLabel } from '@/tools/privacy'
import type { ToolPrivacy } from '@/tools/types'

const props = defineProps<{
  privacy: ToolPrivacy
  compact?: boolean
}>()

const label = computed(() => getToolPrivacyLabel(props.privacy))
const icon = computed(() => props.privacy === 'network-on-action' ? Link2 : ShieldCheck)
const variant = computed(() => props.privacy === 'network-on-action' ? 'secondary' : 'outline')
</script>

<template>
  <Badge
    :variant="variant"
    class="gap-1.5"
    :aria-label="compact ? label : undefined"
  >
    <component :is="icon" class="h-3 w-3 text-primary/85" />
    <span :class="compact ? 'sr-only sm:not-sr-only' : undefined">{{ label }}</span>
  </Badge>
</template>
