<script setup lang="ts">
import {
  Braces,
  CircleDot,
  Moon,
  Search,
  Star,
  SunMedium,
  TerminalSquare,
} from '@lucide/vue'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getToolByPath, tools } from '@/tools/registry'
import { usePreferencesStore } from '@/stores/preferences'
import { useToolsStore } from '@/stores/tools'

const route = useRoute()
const preferences = usePreferencesStore()
const toolsStore = useToolsStore()

const currentTool = computed(() => getToolByPath(route.path) ?? tools[0])
const themeIcon = computed(() => preferences.effectiveTheme === 'dark' ? SunMedium : Moon)
const favoriteCount = computed(() => toolsStore.favoriteIds.length)

watch(
  currentTool,
  (tool) => {
    toolsStore.recordRecent(tool.id)
  },
  { immediate: true },
)

function toggleTheme() {
  preferences.setTheme(preferences.effectiveTheme === 'dark' ? 'light' : 'dark')
}

function isFavorite(toolId: string) {
  return toolsStore.favoriteIds.includes(toolId)
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="sticky top-0 z-20 border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur md:px-6">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <RouterLink to="/tools/json" class="flex min-w-0 items-center gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/35 bg-primary/12 text-primary">
            <TerminalSquare class="h-4 w-4" />
          </span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-semibold tracking-wide">Developer Toolbox</span>
            <span class="block truncate text-xs text-muted-foreground">LAN-ready local utilities</span>
          </span>
        </RouterLink>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Search tools"
            class="h-9 w-9 border-border/90 bg-card/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Search class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Toggle theme"
            class="h-9 w-9 border-border/90 bg-card/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
            @click="toggleTheme"
          >
            <component :is="themeIcon" class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>

    <main class="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-[17rem_minmax(0,1fr)] md:px-6 lg:py-7">
      <aside class="self-start overflow-hidden rounded-lg border border-border/80 bg-card/72 p-3">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-foreground">Tools</p>
            <p class="truncate text-xs text-muted-foreground">{{ favoriteCount }} favorites</p>
          </div>
          <Badge variant="secondary" class="h-6 gap-1">
            <CircleDot class="h-3 w-3 text-primary" />
            Offline
          </Badge>
        </div>

        <nav class="flex gap-1 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0">
          <div
            v-for="tool in tools"
            :key="tool.id"
            class="group grid w-52 shrink-0 grid-cols-[1fr_2rem] items-center gap-1 rounded-md md:w-auto"
          >
            <RouterLink
              :to="tool.path"
              class="min-w-0 rounded-md px-3 py-2 text-sm transition-colors"
              :class="[
                route.path === tool.path
                  ? 'bg-primary/12 text-primary'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
              ]"
            >
              <span class="flex min-w-0 items-center gap-2">
                <Braces v-if="tool.id === 'json'" class="h-4 w-4 shrink-0" />
                <span v-else class="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-45" />
                <span class="truncate">{{ tool.title }}</span>
              </span>
            </RouterLink>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              :aria-label="`${isFavorite(tool.id) ? 'Remove' : 'Add'} ${tool.title} favorite`"
              class="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-foreground"
              @click="toolsStore.toggleFavorite(tool.id)"
            >
              <Star
                class="h-4 w-4"
                :class="isFavorite(tool.id) ? 'fill-primary text-primary' : ''"
              />
            </Button>
          </div>
        </nav>
      </aside>

      <section class="min-w-0">
        <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm text-muted-foreground">{{ currentTool.category }} / browser-only</p>
            <h1 class="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {{ currentTool.title }}
            </h1>
          </div>
          <Badge :variant="currentTool.status === 'active' ? 'default' : 'secondary'">
            {{ currentTool.status === 'active' ? 'Active' : 'Planned' }}
          </Badge>
        </div>

        <RouterView />
      </section>
    </main>
  </div>
</template>
