# Tool Directory Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the long sidebar tool list with a scalable tool directory system that supports 100+ tools through registry metadata, directory routes, category routes, and searchable grouped browsing.

**Architecture:** Add pure catalog helpers in `src/tools/catalog.ts` with Vitest coverage, extend registry metadata in `src/tools/types.ts` and `src/tools/registry.ts`, add `ToolDirectory.vue` and `ToolCategory.vue` for browsing, and update `AppShell.vue` plus `router.ts` so the sidebar navigates categories rather than every tool.

**Tech Stack:** Vue 3, TypeScript, Vue Router, Pinia, shadcn-vue components, lucide-vue icons, Vitest, Playwright.

---

## Execution Rules

- Work from `/Users/subeipo/Documents/code/toolbox`.
- Stay on `main`.
- Use `apply_patch` for manual edits.
- Follow TDD for catalog helpers.
- Keep existing concrete tool routes stable.
- Run full verification before committing.

---

### Task 1: Add Catalog Helper Tests

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/catalog.test.ts`

**Steps:**

1. Write failing tests for:
   - category sections ordered by `categoryOrder`
   - tools sorted by `order` then title
   - tools grouped by `group`
   - search matching title, description, keywords, and aliases
   - unknown categories returning no grouped tools
2. Run `npm test -- src/tools/catalog.test.ts`.
3. Confirm failure because `src/tools/catalog.ts` does not exist.

---

### Task 2: Implement Catalog Helpers

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/catalog.ts`
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/types.ts`

**Steps:**

1. Add optional metadata fields to `ToolDefinition`:
   - `group?: string`
   - `aliases?: string[]`
   - `featured?: boolean`
   - `order?: number`
2. Implement category labels, category order, category codes, sorting, search, sections, and grouped category helpers.
3. Run `npm test -- src/tools/catalog.test.ts`.
4. Confirm pass.

---

### Task 3: Enrich Registry Metadata

**Files:**
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/registry.ts`
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/registry.test.ts`

**Steps:**

1. Add `group`, `aliases`, `featured`, and `order` metadata to existing tools.
2. Update registry tests to confirm every tool has `group` and `order`.
3. Run `npm test -- src/tools/registry.test.ts src/tools/catalog.test.ts`.
4. Confirm pass.

---

### Task 4: Add Directory and Category Views

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/catalog/ToolDirectory.vue`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/catalog/ToolCategory.vue`

**Steps:**

1. Build `ToolDirectory.vue` with:
   - local search
   - recent and favorites sections
   - featured section
   - category preview sections
2. Build `ToolCategory.vue` with:
   - category-aware search
   - group sections
   - empty state
3. Reuse existing button, badge, and tool metadata patterns.

---

### Task 5: Update Router and Shell

**Files:**
- Modify: `/Users/subeipo/Documents/code/toolbox/src/app/router.ts`
- Modify: `/Users/subeipo/Documents/code/toolbox/src/app/layout/AppShell.vue`

**Steps:**

1. Redirect `/` to `/tools`.
2. Add `/tools` route for directory.
3. Add `/tools/category/:category` route before concrete tool routes.
4. Update `AppShell.vue`:
   - import catalog metadata/helpers
   - compute route mode: directory, category, or tool
   - render sidebar as directory/recent/favorites/category navigation
   - keep command palette and tool pages working
   - include `aliases` in command search
5. Run `npm run build`.
6. Confirm pass.

---

### Task 6: Verification and Commit

**Files:**
- All changed files.

**Steps:**

1. Run `npm test`.
2. Run `npm run build`.
3. Run Playwright smoke script for `/tools`, `/tools/category/format`, and `/tools/json`.
4. Inspect `git diff --stat`.
5. Commit with `feat: add scalable tool directory`.
