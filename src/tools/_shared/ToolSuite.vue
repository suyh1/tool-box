<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface ToolSuiteItem {
  id: string
  label: string
  description: string
  component: Component
}

const props = defineProps<{
  title: string
  description: string
  items: ToolSuiteItem[]
}>()

const defaultValue = computed(() => props.items[0]?.id ?? '')
</script>

<template>
  <section class="grid gap-4">
    <header class="grid gap-1">
      <h2 class="text-base font-semibold text-foreground">{{ title }}</h2>
      <p class="max-w-3xl text-sm leading-6 text-muted-foreground">{{ description }}</p>
    </header>

    <Tabs :default-value="defaultValue" class="gap-4">
      <div class="overflow-x-auto">
        <TabsList
          variant="line"
          class="h-auto w-max min-w-full justify-start gap-1 rounded-none border-b border-border bg-transparent p-0"
        >
          <TabsTrigger
            v-for="item in items"
            :key="item.id"
            :value="item.id"
            class="h-10 flex-none px-3"
          >
            {{ item.label }}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        v-for="item in items"
        :key="item.id"
        :value="item.id"
        class="mt-0"
      >
        <component :is="item.component" />
      </TabsContent>
    </Tabs>
  </section>
</template>
