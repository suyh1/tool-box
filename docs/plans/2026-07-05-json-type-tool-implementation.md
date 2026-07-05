# JSON Type Tool Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an active local-first JSON-to-type generator for TypeScript interfaces, Java classes, Go structs, and Zod schemas.

**Architecture:** Keep conversion behavior in `src/tools/json-type/json-type.ts` with no Vue dependency. Render a focused Vue tool in `JsonTypeTool.vue` and register it through the existing tool registry so routing, navigation, favorites, and recent tools keep working from metadata.

**Tech Stack:** Vue 3, TypeScript, Vite, shadcn-vue components, lucide-vue icons, Vitest.

---

## Execution Rules

- Work from `/Users/subeipo/Documents/code/toolbox`.
- Stay on `main`; the user explicitly requested edits on `main`.
- Use `apply_patch` for manual edits.
- Follow TDD for pure conversion behavior.
- Run the verification command listed in each task.
- Commit implementation changes after verification.

---

### Task 1: Add JSON Type Conversion Tests

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/json-type/json-type.test.ts`

**Step 1: Write failing tests**

Add tests covering:

- TypeScript nested interfaces, optional fields from object arrays, nullable values, and arrays.
- Java classes with nested classes and `List<T>` output.
- Go structs with exported field names and JSON tags.
- Zod schemas with `.optional()` and `.nullable()`.
- Invalid JSON and unsupported root shapes.

**Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/tools/json-type/json-type.test.ts
```

Expected: FAIL because `src/tools/json-type/json-type.ts` does not exist yet.

---

### Task 2: Implement JSON Type Conversion Logic

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/json-type/json-type.ts`
- Test: `/Users/subeipo/Documents/code/toolbox/src/tools/json-type/json-type.test.ts`

**Step 1: Implement minimal conversion API**

Expose:

```ts
export type JsonTypeTarget = 'typescript' | 'java' | 'go' | 'zod'

export type JsonTypeResult =
  | { ok: true; value: string; meta: string }
  | { ok: false; message: string }

export function convertJsonToType(
  input: string,
  target: JsonTypeTarget,
  rootName?: string,
): JsonTypeResult
```

Implementation details:

- Parse JSON safely.
- Reject non-object roots and empty object arrays.
- Merge object arrays into a shared inferred shape.
- Track optional fields when object-array items omit keys.
- Track nullable fields when any value is `null`.
- Sanitize type names and language identifiers.
- Generate TypeScript, Java, Go, and Zod output from the same inferred model.

**Step 2: Run focused tests**

Run:

```bash
npm test -- src/tools/json-type/json-type.test.ts
```

Expected: PASS.

---

### Task 3: Register the Tool

**Files:**
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/types.ts`
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/registry.ts`
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/registry.test.ts`

**Step 1: Update registry metadata**

- Add `code` to `ToolCategory`.
- Register `json-type` as active:
  - Title: `JSON 转类型`
  - Description: `从 JSON 样例生成 TypeScript、Java、Go 和 Zod 类型。`
  - Path: `/tools/json-type`
  - Category: `code`
  - Keywords: `json`, `type`, `typescript`, `interface`, `java`, `go`, `zod`, `schema`

**Step 2: Add/adjust registry tests**

Confirm the new tool is active and discoverable by id.

**Step 3: Run registry tests**

Run:

```bash
npm test -- src/tools/registry.test.ts
```

Expected: PASS.

---

### Task 4: Add Vue Tool UI

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/json-type/JsonTypeTool.vue`

**Step 1: Build UI using existing patterns**

Use existing shared components:

- `ToolPanel`
- `ToolActionBar`
- `ToolAnnouncer`
- `ToolTextareaPanel`
- `Button`

Controls:

- Root name input, default `Root`.
- Target select, default `typescript`.
- Primary action `生成类型`.
- Secondary actions: sample, clear, copy output.

Text areas:

- Input: JSON sample.
- Output: generated type code, read-only.

**Step 2: Catch conversion errors**

Show `JsonTypeResult` errors in the same visible alert pattern used by existing tools.

**Step 3: Run typecheck/build**

Run:

```bash
npm run build
```

Expected: PASS.

---

### Task 5: Full Verification and Commit

**Files:**
- All files changed in Tasks 1-4.

**Step 1: Run unit tests**

Run:

```bash
npm test
```

Expected: PASS.

**Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

**Step 3: Inspect git diff**

Run:

```bash
git diff --stat
git diff -- src/tools/json-type src/tools/registry.ts src/tools/types.ts src/tools/registry.test.ts
```

Expected: Changes match the approved design without unrelated edits.

**Step 4: Commit**

Run:

```bash
git add src/tools/json-type src/tools/registry.ts src/tools/types.ts src/tools/registry.test.ts docs/plans/2026-07-05-json-type-tool-implementation.md
git commit -m "feat: add json type generation tool"
```

Expected: commit succeeds.
