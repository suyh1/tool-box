<script setup lang="ts">
import { CircleDot, Moon, Search, SunMedium, TerminalSquare } from '@lucide/vue'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { usePreferencesStore } from '@/stores/preferences'

const preferences = usePreferencesStore()

const themeIcon = computed(() => preferences.effectiveTheme === 'dark' ? SunMedium : Moon)

function toggleTheme() {
  preferences.setTheme(preferences.effectiveTheme === 'dark' ? 'light' : 'dark')
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="border-b border-border/80 bg-background/88 px-4 py-3 backdrop-blur md:px-6">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <RouterLink to="/tools/json" class="flex min-w-0 items-center gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/35 bg-primary/12 text-primary">
            <TerminalSquare class="h-4 w-4" />
          </span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-semibold tracking-wide">Developer Toolbox</span>
            <span class="block truncate text-xs text-muted-foreground">local-first utilities</span>
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

    <main class="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-[16rem_1fr] md:px-6 lg:py-7">
      <aside class="rounded-lg border border-border/80 bg-card/72 p-3">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-xs font-medium text-muted-foreground">Workspace</p>
          <span class="inline-flex h-6 items-center gap-1 rounded-md bg-primary/12 px-2 text-xs font-medium text-primary">
            <CircleDot class="h-3 w-3" />
            Offline
          </span>
        </div>
        <nav class="grid gap-1">
          <RouterLink
            to="/tools/json"
            class="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-foreground"
          >
            JSON Formatter
          </RouterLink>
          <span class="rounded-md px-3 py-2 text-sm text-muted-foreground">More tools soon</span>
        </nav>
      </aside>

      <section class="min-w-0 rounded-lg border border-border/80 bg-card/76 p-5">
        <p class="text-xs font-medium uppercase text-muted-foreground">Tool workspace</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          JSON Formatter
        </h1>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          The tool registry and utility workspace will be wired in the next step. This shell is already local-first,
          responsive, and ready for browser-only utilities.
        </p>
      </section>
    </main>
  </div>
</template>
