<script setup lang="ts">
import { Star } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToolsStore } from '@/stores/tools'
import ToolPrivacyBadge from '@/tools/_shared/ToolPrivacyBadge.vue'
import {
  categoryCodes,
  getCategorySections,
  getFeaturedTools,
  searchTools,
} from '@/tools/catalog'
import { getToolById, tools } from '@/tools/registry'
import type { ToolDefinition } from '@/tools/types'

const route = useRoute()
const toolsStore = useToolsStore()
const emit = defineEmits<{
  (event: 'open-tool', toolId: string): void
}>()

const favoriteTools = computed(() => tools
  .filter((tool) => toolsStore.favoriteIds.includes(tool.id)))
const recentTools = computed(() => toolsStore.recentIds
  .map((toolId) => getToolById(toolId))
  .filter((tool): tool is ToolDefinition => Boolean(tool)))
const featuredTools = computed(() => getFeaturedTools(tools).slice(0, 8))
const matchingTools = computed(() => searchTools(tools, ''))
const categorySections = computed(() => getCategorySections(matchingTools.value))
const view = computed(() => typeof route.query.view === 'string' ? route.query.view : 'all')

function toggleFavorite(toolId: string) {
  toolsStore.toggleFavorite(toolId)
}

function openTool(toolId: string) {
  emit('open-tool', toolId)
}
</script>

<template>
  <section class="grid gap-4">

    <div
      v-if="view === 'recent'"
      class="rounded-lg border border-border bg-card p-4 md:p-5"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-foreground">最近使用</h2>
        <Badge variant="secondary">{{ recentTools.length }}</Badge>
      </div>
      <div v-if="recentTools.length" class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <article v-for="tool in recentTools" :key="tool.id" class="rounded-md border border-border bg-background/55 p-3">
          <button type="button" class="block w-full text-left" @click="openTool(tool.id)">
            <div class="flex items-center justify-between gap-2">
              <h3 class="truncate text-sm font-medium text-foreground">{{ tool.title }}</h3>
              <div class="flex shrink-0 items-center gap-1.5">
                <Badge variant="outline">{{ categoryCodes[tool.category] }}</Badge>
                <ToolPrivacyBadge :privacy="tool.privacy" compact />
              </div>
            </div>
            <p class="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{{ tool.description }}</p>
          </button>
        </article>
      </div>
      <p v-else class="text-sm text-muted-foreground">打开任意工具后，它会出现在这里。</p>
    </div>

    <div
      v-else-if="view === 'favorites'"
      class="rounded-lg border border-border bg-card p-4 md:p-5"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-foreground">收藏工具</h2>
        <Badge variant="secondary">{{ favoriteTools.length }}</Badge>
      </div>
      <div v-if="favoriteTools.length" class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <article v-for="tool in favoriteTools" :key="tool.id" class="rounded-md border border-border bg-background/55 p-3">
          <button type="button" class="block w-full text-left" @click="openTool(tool.id)">
            <div class="flex items-center justify-between gap-2">
              <h3 class="truncate text-sm font-medium text-foreground">{{ tool.title }}</h3>
              <div class="flex shrink-0 items-center gap-1.5">
                <Badge variant="outline">{{ categoryCodes[tool.category] }}</Badge>
                <ToolPrivacyBadge :privacy="tool.privacy" compact />
              </div>
            </div>
            <p class="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{{ tool.description }}</p>
          </button>
        </article>
      </div>
      <p v-else class="text-sm text-muted-foreground">在目录或工具页点击星标后，常用工具会固定在这里。</p>
    </div>

    <template v-else>
      <section v-if="featuredTools.length" class="rounded-lg border border-border bg-card p-4 md:p-5">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold text-foreground">精选工具</h2>
          <Badge variant="secondary">{{ featuredTools.length }}</Badge>
        </div>
        <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <article v-for="tool in featuredTools" :key="tool.id" class="rounded-md border border-border bg-background/55 p-3">
            <div class="flex items-start justify-between gap-2">
              <button type="button" class="min-w-0 text-left" @click="openTool(tool.id)">
                <div class="flex flex-wrap items-center gap-1.5">
                  <h3 class="truncate text-sm font-medium text-foreground">{{ tool.title }}</h3>
                  <ToolPrivacyBadge :privacy="tool.privacy" compact />
                </div>
                <p class="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{{ tool.description }}</p>
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="h-7 w-7 shrink-0 text-muted-foreground"
                :aria-label="`${toolsStore.favoriteIds.includes(tool.id) ? '移除' : '添加'} ${tool.title} 收藏`"
                @click="toggleFavorite(tool.id)"
              >
                <Star class="h-3.5 w-3.5" :class="toolsStore.favoriteIds.includes(tool.id) ? 'fill-primary text-primary' : ''" />
              </Button>
            </div>
          </article>
        </div>
      </section>

      <section class="grid gap-3">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold text-foreground">
            按分类浏览
          </h2>
          <Badge variant="outline">{{ matchingTools.length }} 个工具</Badge>
        </div>

        <div v-if="categorySections.length" class="grid gap-3">
          <article
            v-for="section in categorySections"
            :key="section.category"
            class="rounded-lg border border-border bg-card p-4"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <RouterLink :to="`/tools/category/${section.category}`" class="min-w-0">
                <div class="flex items-center gap-2">
                  <Badge variant="secondary">{{ section.code }}</Badge>
                  <h3 class="text-sm font-semibold text-foreground">{{ section.label }}</h3>
                  <span class="text-xs text-muted-foreground">{{ section.count }} 个工具</span>
                </div>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ section.tools.slice(0, 4).map((tool) => tool.title).join('、') }}
                </p>
              </RouterLink>
              <RouterLink
                :to="`/tools/category/${section.category}`"
                class="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                查看全部
              </RouterLink>
            </div>
          </article>
        </div>
        <p v-else class="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
          没有找到匹配的工具。换个关键词试试。
        </p>
      </section>
    </template>
  </section>
</template>
