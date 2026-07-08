<script setup lang="ts">
import {
  Binary,
  CaseSensitive,
  Clock3,
  Code2,
  FileJson2,
  Fingerprint,
  ShieldCheck,
  Star,
  TerminalSquare,
} from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  categoryCodes,
  categoryLabels,
  categoryOrder,
  isToolCategory,
} from '@/tools/catalog'
import { getToolById, getToolByPath, tools } from '@/tools/registry'
import { useToolsStore } from '@/stores/tools'
import type { ToolCategory } from '@/tools/types'

const open = defineModel<boolean>('open', { required: true })
const route = useRoute()
const toolsStore = useToolsStore()

const currentTool = computed(() => getToolByPath(route.path))
const currentCategory = computed(() => {
  const value = String(route.params.category ?? '')
  return isToolCategory(value) ? value : null
})
const directoryView = computed<'all' | 'recent' | 'favorites'>(() => {
  if (route.path !== '/tools') {
    return 'all'
  }

  return route.query.view === 'recent' || route.query.view === 'favorites'
    ? route.query.view
    : 'all'
})
const isDirectoryRoute = computed(() => route.path === '/tools' && directoryView.value === 'all')
const favoriteCount = computed(() => toolsStore.favoriteIds.length)
const activeToolCount = computed(() => tools.filter((tool) => tool.status === 'active').length)
const recentTools = computed(() => toolsStore.recentIds
  .map((toolId) => getToolById(toolId))
  .filter(Boolean)
  .slice(0, 3))
const categoryCounts = computed(() => tools.reduce((counts, tool) => {
  counts[tool.category] = (counts[tool.category] ?? 0) + 1
  return counts
}, {} as Record<ToolCategory, number>))

function closeNav() {
  open.value = false
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent side="left" class="w-[min(22rem,calc(100vw-2rem))] overflow-auto p-4 md:hidden">
      <SheetHeader>
        <SheetTitle>工具导航</SheetTitle>
        <SheetDescription>打开目录、最近使用、收藏或分类。</SheetDescription>
      </SheetHeader>

      <nav aria-label="移动工具导航" class="mt-4 grid gap-4">
        <div class="grid gap-1">
          <RouterLink
            to="/tools"
            :aria-current="isDirectoryRoute ? 'page' : undefined"
            class="grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-3 py-3 transition-all"
            :class="[
              isDirectoryRoute
                ? 'bg-secondary/88 text-foreground ring-1 ring-white/8'
                : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
            ]"
            @click="closeNav"
          >
            <span class="flex h-6 w-6 items-center justify-center rounded border border-border/60 bg-background/45">
              <TerminalSquare class="h-3.5 w-3.5" />
            </span>
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium">工具目录</span>
              <span class="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">ALL / {{ activeToolCount }}</span>
            </span>
            <Badge variant="secondary">总览</Badge>
          </RouterLink>

          <RouterLink
            to="/tools?view=recent"
            :aria-current="route.path === '/tools' && directoryView === 'recent' ? 'page' : undefined"
            class="grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-3 py-3 transition-all"
            :class="[
              route.path === '/tools' && directoryView === 'recent'
                ? 'bg-secondary/88 text-foreground ring-1 ring-white/8'
                : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
            ]"
            @click="closeNav"
          >
            <span class="flex h-6 w-6 items-center justify-center rounded border border-border/60 bg-background/45">
              <Clock3 class="h-3.5 w-3.5" />
            </span>
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium">最近使用</span>
              <span class="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">RECENT</span>
            </span>
            <Badge variant="outline">{{ recentTools.length }}</Badge>
          </RouterLink>

          <RouterLink
            to="/tools?view=favorites"
            :aria-current="route.path === '/tools' && directoryView === 'favorites' ? 'page' : undefined"
            class="grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-3 py-3 transition-all"
            :class="[
              route.path === '/tools' && directoryView === 'favorites'
                ? 'bg-secondary/88 text-foreground ring-1 ring-white/8'
                : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
            ]"
            @click="closeNav"
          >
            <span class="flex h-6 w-6 items-center justify-center rounded border border-border/60 bg-background/45">
              <Star class="h-3.5 w-3.5" />
            </span>
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium">收藏工具</span>
              <span class="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">FAV</span>
            </span>
            <Badge variant="outline">{{ favoriteCount }}</Badge>
          </RouterLink>
        </div>

        <div class="grid gap-2">
          <div class="flex items-center justify-between px-1">
            <p class="font-mono text-[11px] text-muted-foreground">categories</p>
            <Badge variant="outline">{{ categoryOrder.length }}</Badge>
          </div>
          <RouterLink
            v-for="category in categoryOrder"
            :key="category"
            :to="`/tools/category/${category}`"
            class="grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-3 py-3 transition-all"
            :class="[
              (currentCategory === category || currentTool?.category === category)
                ? 'bg-secondary/88 text-foreground ring-1 ring-white/8'
                : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
            ]"
            @click="closeNav"
          >
            <span class="flex h-6 w-6 items-center justify-center rounded border border-border/60 bg-background/45">
              <component
                :is="category === 'time' ? Clock3 : category === 'security' ? ShieldCheck : category === 'generate' ? Fingerprint : category === 'code' ? Code2 : category === 'text' ? CaseSensitive : category === 'encode' ? Binary : FileJson2"
                class="h-3.5 w-3.5"
              />
            </span>
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium">{{ categoryLabels[category] }}</span>
              <span class="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">{{ categoryCodes[category] }}</span>
            </span>
            <Badge variant="outline">{{ categoryCounts[category] ?? 0 }}</Badge>
          </RouterLink>
        </div>
      </nav>
    </SheetContent>
  </Sheet>
</template>
