# More Developer Tools Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add YAML/JSON conversion, Cron parsing, cURL-to-code generation, and SQL formatting tools to the local developer toolbox.

**Architecture:** Each tool gets a pure TypeScript utility module, Vitest suite, and Vue component under `src/tools/<tool>`. Shared routing, navigation, favorites, and recent tools continue to flow from `src/tools/registry.ts`.

**Tech Stack:** Vue 3, TypeScript, Vite, Vitest, shadcn-vue components, lucide-vue icons, `yaml`, `sql-formatter`.

---

## Execution Rules

- Work from `/Users/subeipo/Documents/code/toolbox`.
- Stay on `main`; the user requested edits on `main`.
- Use `apply_patch` for manual edits.
- Follow TDD for pure utility modules.
- Run verification after each task.
- Commit after the full batch passes.

---

### Task 1: Add YAML / JSON Conversion

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/yaml-json/yaml-json.test.ts`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/yaml-json/yaml-json.ts`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/yaml-json/YamlJsonTool.vue`

**Steps:**

1. Write failing tests for JSON to YAML, YAML to JSON, invalid JSON, and invalid YAML.
2. Run `npm test -- src/tools/yaml-json/yaml-json.test.ts` and confirm failure.
3. Install `yaml`.
4. Implement conversion helpers.
5. Run focused tests and confirm pass.
6. Add Vue UI with existing shared components.

---

### Task 2: Add Cron Expression Parser

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/cron/cron.test.ts`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/cron/cron.ts`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/cron/CronTool.vue`

**Steps:**

1. Write failing tests for next executions, step ranges, aliases, invalid length, and invalid values.
2. Run `npm test -- src/tools/cron/cron.test.ts` and confirm failure.
3. Implement dependency-free 5-field cron parser and next execution generator.
4. Run focused tests and confirm pass.
5. Add Vue UI with expression input, reference datetime input, sample, clear, and copy output.

---

### Task 3: Add cURL to Code Generator

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/curl/curl.test.ts`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/curl/curl.ts`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/curl/CurlTool.vue`

**Steps:**

1. Write failing tests for tokenization, headers, method/body parsing, fetch output, axios output, Python requests output, auth, and missing URL.
2. Run `npm test -- src/tools/curl/curl.test.ts` and confirm failure.
3. Implement a common cURL parser and code generators.
4. Run focused tests and confirm pass.
5. Add Vue UI with target select, sample, clear, and copy output.

---

### Task 4: Add SQL Formatting

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/sql/sql.test.ts`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/sql/sql.ts`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/sql/SqlTool.vue`

**Steps:**

1. Write failing tests for formatting, minifying, empty input, and invalid option handling.
2. Run `npm test -- src/tools/sql/sql.test.ts` and confirm failure.
3. Install `sql-formatter`.
4. Implement formatting and minify helpers.
5. Run focused tests and confirm pass.
6. Add Vue UI with format, minify, sample, clear, and copy output.

---

### Task 5: Register Tools and Verify

**Files:**
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/registry.ts`
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/registry.test.ts`
- Modify: `/Users/subeipo/Documents/code/toolbox/src/app/layout/AppShell.vue`
- Modify: `/Users/subeipo/Documents/code/toolbox/package.json`
- Modify: `/Users/subeipo/Documents/code/toolbox/package-lock.json`

**Steps:**

1. Register all four tools as active.
2. Add icon mappings for the new tool ids.
3. Update registry tests to confirm lookup.
4. Run `npm test`.
5. Run `npm run build`.
6. Run a Playwright smoke script against new routes.
7. Inspect `git diff --stat`.
8. Commit with `feat: add more developer tools`.
