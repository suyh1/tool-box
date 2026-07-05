# Text Tools Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add active case conversion, regex testing, and line diff tools to the local-first Vue developer toolbox.

**Architecture:** Keep each tool in its own `src/tools/<tool>` module with a pure TypeScript utility file, a Vitest suite, and a Vue component. Register each component through the existing tool registry so routing, favorites, recent tools, and navigation continue to work from metadata.

**Tech Stack:** Vue 3, TypeScript, Vue Router, Pinia, shadcn-vue components, lucide-vue icons, Vitest, Playwright, Vite.

---

## Execution Rules

- Work from `/Users/subeipo/Documents/code/toolbox`.
- Stay on `main`; do not create a new branch or worktree.
- Preserve the approved design doc at `/Users/subeipo/Documents/code/toolbox/docs/plans/2026-07-05-text-tools-design.md`.
- Use `apply_patch` for manual file edits.
- Follow TDD for each pure utility module.
- Run the verification command listed in each task.
- Commit at the end of each task.

---

### Task 1: Add Case Conversion Logic

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/case/case.test.ts`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/case/case.ts`

**Step 1: Write failing tests**

Create `/Users/subeipo/Documents/code/toolbox/src/tools/case/case.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { convertCases, splitWords } from './case'

describe('case utilities', () => {
  it('splits punctuation, separators, and camel boundaries into words', () => {
    expect(splitWords('helloWorld API_response-id')).toEqual([
      'hello',
      'world',
      'api',
      'response',
      'id',
    ])
  })

  it('converts text to common naming formats', () => {
    expect(convertCases('hello world_api')).toEqual({
      camel: 'helloWorldApi',
      pascal: 'HelloWorldApi',
      snake: 'hello_world_api',
      kebab: 'hello-world-api',
      constant: 'HELLO_WORLD_API',
      title: 'Hello World Api',
    })
  })

  it('returns empty formats for empty input', () => {
    expect(convertCases('   ')).toEqual({
      camel: '',
      pascal: '',
      snake: '',
      kebab: '',
      constant: '',
      title: '',
    })
  })
})
```

**Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/tools/case/case.test.ts
```

Expected: FAIL because `src/tools/case/case.ts` does not exist yet.

**Step 3: Implement case utilities**

Create `/Users/subeipo/Documents/code/toolbox/src/tools/case/case.ts`:

```ts
export interface CaseConversions {
  camel: string
  pascal: string
  snake: string
  kebab: string
  constant: string
  title: string
}

export function splitWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean)
}

function capitalize(word: string) {
  return word ? `${word.slice(0, 1).toUpperCase()}${word.slice(1)}` : ''
}

export function convertCases(input: string): CaseConversions {
  const words = splitWords(input)
  const pascalWords = words.map(capitalize)

  return {
    camel: words.length === 0 ? '' : `${words[0]}${pascalWords.slice(1).join('')}`,
    pascal: pascalWords.join(''),
    snake: words.join('_'),
    kebab: words.join('-'),
    constant: words.join('_').toUpperCase(),
    title: pascalWords.join(' '),
  }
}
```

**Step 4: Verify tests pass**

Run:

```bash
npm test -- src/tools/case/case.test.ts
```

Expected: PASS.

**Step 5: Commit**

Run:

```bash
git add src/tools/case/case.ts src/tools/case/case.test.ts
git commit -m "feat: add case conversion logic"
```

Expected: commit succeeds.

---

### Task 2: Add Regex Testing Logic

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/regex/regex.test.ts`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/regex/regex.ts`

**Step 1: Write failing tests**

Create `/Users/subeipo/Documents/code/toolbox/src/tools/regex/regex.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { testRegex } from './regex'

describe('regex utilities', () => {
  it('finds global matches with indexes', () => {
    expect(testRegex('\\d+', 'g', 'a12 b345')).toEqual({
      ok: true,
      matches: [
        { value: '12', index: 1, groups: [], namedGroups: {} },
        { value: '345', index: 5, groups: [], namedGroups: {} },
      ],
    })
  })

  it('captures numbered and named groups', () => {
    expect(testRegex('(?<name>[a-z]+):(\\d+)', 'g', 'port:443')).toEqual({
      ok: true,
      matches: [
        {
          value: 'port:443',
          index: 0,
          groups: ['port', '443'],
          namedGroups: { name: 'port' },
        },
      ],
    })
  })

  it('returns errors for invalid patterns', () => {
    expect(testRegex('[', 'g', 'text')).toMatchObject({ ok: false })
  })

  it('returns errors for duplicate flags', () => {
    expect(testRegex('a', 'gg', 'aaa')).toMatchObject({ ok: false })
  })
})
```

**Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/tools/regex/regex.test.ts
```

Expected: FAIL because `src/tools/regex/regex.ts` does not exist yet.

**Step 3: Implement regex utilities**

Create `/Users/subeipo/Documents/code/toolbox/src/tools/regex/regex.ts`:

```ts
export interface RegexMatch {
  value: string
  index: number
  groups: string[]
  namedGroups: Record<string, string>
}

export type RegexResult =
  | { ok: true; matches: RegexMatch[] }
  | { ok: false; message: string }

const VALID_FLAGS = new Set(['d', 'g', 'i', 'm', 's', 'u', 'v', 'y'])

function normalizeFlags(flags: string): string | { message: string } {
  const trimmed = flags.trim()
  const seen = new Set<string>()

  for (const flag of trimmed) {
    if (!VALID_FLAGS.has(flag)) {
      return { message: `不支持的正则标志：${flag}` }
    }

    if (seen.has(flag)) {
      return { message: `正则标志重复：${flag}` }
    }

    seen.add(flag)
  }

  return trimmed.includes('g') ? trimmed : `${trimmed}g`
}

export function testRegex(pattern: string, flags: string, text: string): RegexResult {
  const normalizedFlags = normalizeFlags(flags)

  if (typeof normalizedFlags !== 'string') {
    return { ok: false, message: normalizedFlags.message }
  }

  let regex: RegExp

  try {
    regex = new RegExp(pattern, normalizedFlags)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `正则表达式无效：${error.message}` : '正则表达式无效',
    }
  }

  const matches: RegexMatch[] = []

  for (const match of text.matchAll(regex)) {
    matches.push({
      value: match[0],
      index: match.index ?? 0,
      groups: match.slice(1).map((group) => group ?? ''),
      namedGroups: Object.fromEntries(
        Object.entries(match.groups ?? {}).map(([key, value]) => [key, value ?? '']),
      ),
    })

    if (match[0] === '') {
      regex.lastIndex += 1
    }
  }

  return { ok: true, matches }
}
```

**Step 4: Verify tests pass**

Run:

```bash
npm test -- src/tools/regex/regex.test.ts
```

Expected: PASS.

**Step 5: Commit**

Run:

```bash
git add src/tools/regex/regex.ts src/tools/regex/regex.test.ts
git commit -m "feat: add regex testing logic"
```

Expected: commit succeeds.

---

### Task 3: Add Line Diff Logic

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/diff/diff.test.ts`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/diff/diff.ts`

**Step 1: Write failing tests**

Create `/Users/subeipo/Documents/code/toolbox/src/tools/diff/diff.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { diffLines, summarizeDiff } from './diff'

describe('diff utilities', () => {
  it('marks unchanged, removed, and added lines', () => {
    expect(diffLines('a\nb\nc', 'a\nx\nc')).toEqual([
      { type: 'unchanged', value: 'a', oldLineNumber: 1, newLineNumber: 1 },
      { type: 'removed', value: 'b', oldLineNumber: 2 },
      { type: 'added', value: 'x', newLineNumber: 2 },
      { type: 'unchanged', value: 'c', oldLineNumber: 3, newLineNumber: 3 },
    ])
  })

  it('summarizes diff rows', () => {
    expect(summarizeDiff(diffLines('a\nb', 'a\nb\nc'))).toEqual({
      added: 1,
      removed: 0,
      unchanged: 2,
    })
  })

  it('handles empty input', () => {
    expect(diffLines('', '')).toEqual([])
  })

  it('handles repeated lines predictably', () => {
    expect(diffLines('a\nb\na', 'b\na')).toEqual([
      { type: 'removed', value: 'a', oldLineNumber: 1 },
      { type: 'unchanged', value: 'b', oldLineNumber: 2, newLineNumber: 1 },
      { type: 'unchanged', value: 'a', oldLineNumber: 3, newLineNumber: 2 },
    ])
  })
})
```

**Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/tools/diff/diff.test.ts
```

Expected: FAIL because `src/tools/diff/diff.ts` does not exist yet.

**Step 3: Implement diff utilities**

Create `/Users/subeipo/Documents/code/toolbox/src/tools/diff/diff.ts`:

```ts
export type DiffRowType = 'added' | 'removed' | 'unchanged'

export interface DiffRow {
  type: DiffRowType
  value: string
  oldLineNumber?: number
  newLineNumber?: number
}

export interface DiffSummary {
  added: number
  removed: number
  unchanged: number
}

function splitLines(input: string) {
  return input.length === 0 ? [] : input.replace(/\r\n/g, '\n').split('\n')
}

export function diffLines(oldText: string, newText: string): DiffRow[] {
  const oldLines = splitLines(oldText)
  const newLines = splitLines(newText)
  const table = Array.from({ length: oldLines.length + 1 }, () =>
    Array.from({ length: newLines.length + 1 }, () => 0),
  )

  for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex -= 1) {
    for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex -= 1) {
      table[oldIndex][newIndex] = oldLines[oldIndex] === newLines[newIndex]
        ? table[oldIndex + 1][newIndex + 1] + 1
        : Math.max(table[oldIndex + 1][newIndex], table[oldIndex][newIndex + 1])
    }
  }

  const rows: DiffRow[] = []
  let oldIndex = 0
  let newIndex = 0

  while (oldIndex < oldLines.length && newIndex < newLines.length) {
    if (oldLines[oldIndex] === newLines[newIndex]) {
      rows.push({
        type: 'unchanged',
        value: oldLines[oldIndex],
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1,
      })
      oldIndex += 1
      newIndex += 1
    } else if (table[oldIndex + 1][newIndex] >= table[oldIndex][newIndex + 1]) {
      rows.push({ type: 'removed', value: oldLines[oldIndex], oldLineNumber: oldIndex + 1 })
      oldIndex += 1
    } else {
      rows.push({ type: 'added', value: newLines[newIndex], newLineNumber: newIndex + 1 })
      newIndex += 1
    }
  }

  while (oldIndex < oldLines.length) {
    rows.push({ type: 'removed', value: oldLines[oldIndex], oldLineNumber: oldIndex + 1 })
    oldIndex += 1
  }

  while (newIndex < newLines.length) {
    rows.push({ type: 'added', value: newLines[newIndex], newLineNumber: newIndex + 1 })
    newIndex += 1
  }

  return rows
}

export function summarizeDiff(rows: DiffRow[]): DiffSummary {
  return rows.reduce<DiffSummary>(
    (summary, row) => ({
      ...summary,
      [row.type]: summary[row.type] + 1,
    }),
    { added: 0, removed: 0, unchanged: 0 },
  )
}
```

**Step 4: Verify tests pass**

Run:

```bash
npm test -- src/tools/diff/diff.test.ts
```

Expected: PASS.

**Step 5: Commit**

Run:

```bash
git add src/tools/diff/diff.ts src/tools/diff/diff.test.ts
git commit -m "feat: add line diff logic"
```

Expected: commit succeeds.

---

### Task 4: Build The Tool Interfaces

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/case/CaseTool.vue`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/regex/RegexTool.vue`
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/diff/DiffTool.vue`
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/registry.ts`
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/registry.test.ts`

**Step 1: Update registry test expectations first**

Modify `/Users/subeipo/Documents/code/toolbox/src/tools/registry.test.ts` so the status test expects all ten tools to be active:

```ts
it('marks all initial tools as active', () => {
  expect(tools.every((tool) => tool.status === 'active')).toBe(true)
  expect(tools.filter((tool) => tool.status === 'planned')).toHaveLength(0)
})
```

**Step 2: Run registry test to verify failure**

Run:

```bash
npm test -- src/tools/registry.test.ts
```

Expected: FAIL because `regex`, `diff`, and `case` are still planned.

**Step 3: Create Vue components**

Create:

- `/Users/subeipo/Documents/code/toolbox/src/tools/case/CaseTool.vue`
- `/Users/subeipo/Documents/code/toolbox/src/tools/regex/RegexTool.vue`
- `/Users/subeipo/Documents/code/toolbox/src/tools/diff/DiffTool.vue`

Implementation requirements:

- Use Chinese visible text and ARIA labels.
- Use existing `Button`, `Badge`, `Textarea`, and `Input` components.
- Include sample, clear, and copy actions where useful.
- Keep desktop layouts dense and two-column where inputs benefit from comparison.
- Do not add new runtime dependencies.

**Step 4: Activate registry entries**

Modify `/Users/subeipo/Documents/code/toolbox/src/tools/registry.ts`:

```ts
{
  id: 'regex',
  ...
  status: 'active',
  component: () => import('./regex/RegexTool.vue'),
},
{
  id: 'diff',
  ...
  status: 'active',
  component: () => import('./diff/DiffTool.vue'),
},
{
  id: 'case',
  ...
  status: 'active',
  component: () => import('./case/CaseTool.vue'),
},
```

Remove `comingSoon` only if no registry entry still uses it.

**Step 5: Verify unit tests**

Run:

```bash
npm test
```

Expected: PASS.

**Step 6: Commit**

Run:

```bash
git add src/tools/case/CaseTool.vue src/tools/regex/RegexTool.vue src/tools/diff/DiffTool.vue src/tools/registry.ts src/tools/registry.test.ts
git commit -m "feat: add text tool interfaces"
```

Expected: commit succeeds.

---

### Task 5: Final Verification

**Files:**
- Test: `/Users/subeipo/Documents/code/toolbox/package.json`
- Test: `/Users/subeipo/Documents/code/toolbox/tests/json-tool.spec.ts`

**Step 1: Run all unit tests**

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

**Step 3: Run e2e tests**

Run:

```bash
npm run test:e2e
```

Expected: PASS.

**Step 4: Review git status**

Run:

```bash
git status --short --branch
```

Expected: on `main` with a clean working tree after commits.
