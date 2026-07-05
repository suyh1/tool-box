# UI Chinese Localization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Localize all user-facing application UI text to Simplified Chinese without changing tool behavior.

**Architecture:** Replace visible strings directly in the existing Vue components and tool registry. Preserve route paths, tool IDs, pure utility behavior, and English technical identifiers where they are part of the tool domain.

**Tech Stack:** Vite, Vue 3, TypeScript, Vue Router, Pinia, Vitest, Playwright.

---

### Task 1: Add Failing UI Text Expectations

**Files:**
- Modify: `/Users/subeipo/.config/superpowers/worktrees/toolbox/localize-ui-zh/src/tools/registry.test.ts`
- Modify: `/Users/subeipo/.config/superpowers/worktrees/toolbox/localize-ui-zh/tests/json-tool.spec.ts`

**Steps:**
1. Change registry title expectations from English to Chinese.
2. Change JSON e2e labels and buttons from English to Chinese.
3. Run `npm test -- src/tools/registry.test.ts` and confirm it fails before production text changes.

### Task 2: Localize Active UI Text

**Files:**
- Modify: `/Users/subeipo/.config/superpowers/worktrees/toolbox/localize-ui-zh/src/app/layout/AppShell.vue`
- Modify: `/Users/subeipo/.config/superpowers/worktrees/toolbox/localize-ui-zh/src/tools/registry.ts`
- Modify: `/Users/subeipo/.config/superpowers/worktrees/toolbox/localize-ui-zh/src/tools/_shared/TextTool.vue`
- Modify: `/Users/subeipo/.config/superpowers/worktrees/toolbox/localize-ui-zh/src/tools/_shared/ComingSoonTool.vue`
- Modify: active tool Vue files in `/Users/subeipo/.config/superpowers/worktrees/toolbox/localize-ui-zh/src/tools`

**Steps:**
1. Translate app shell navigation, badges, state labels, and ARIA labels.
2. Translate registry titles, descriptions, and categories.
3. Translate shared text tool states and buttons.
4. Translate individual tool labels, placeholders, status text, and result labels.
5. Run `npm test` and confirm all unit tests pass.

### Task 3: Verify Build And Browser Flows

**Files:**
- Test: `/Users/subeipo/.config/superpowers/worktrees/toolbox/localize-ui-zh/tests/json-tool.spec.ts`

**Steps:**
1. Run `npm run build`.
2. Run `npm run test:e2e`.
3. Review git diff for accidental documentation or logic churn outside the approved UI scope.
