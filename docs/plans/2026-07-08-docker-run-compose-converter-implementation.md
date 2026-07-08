# Docker Run / Compose Converter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a local-only Docker Run / Compose converter that performs broad bidirectional conversion and reports lossy or unsupported Docker semantics.

**Architecture:** Add a pure converter module in `src/tools/docker-run-compose/` with TDD coverage, then wrap it in a Vue tool that follows the existing toolbox action/output pattern. Register the tool as a standalone DevOps entry and add it to the existing DevOps YAML suite for discoverability.

**Tech Stack:** Vue 3, TypeScript, YAML package, Vitest, Playwright, existing ToolPanel/ToolTextareaPanel/ToolActionBar/ToolAnnouncer components.

---

## Execution Rules

- Work from `/Users/subeipo/Documents/code/toolbox`.
- Stay on `main`.
- Use `apply_patch` for manual edits.
- Follow TDD for every converter behavior.
- Keep the converter local-only; do not call Docker, a daemon, or the network.
- Run full verification before the final commit.

---

### Task 1: Add RED Tests for Compose to Docker Run

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/docker-run-compose/docker-run-compose.test.ts`

**Step 1: Write failing tests**

Add Vitest cases for:

- converting one Compose service with `image`, `container_name`, `ports`, `environment`, `volumes`, `working_dir`, `user`, `restart`, and `command`
- converting multiple services into multiple `docker run` commands
- converting healthcheck, entrypoint, labels, dns, extra hosts, devices, capabilities, platform, pull policy, init, tty, and stdin
- warning for Compose-only keys such as `build`, `depends_on`, `secrets`, `configs`, `profiles`, and `deploy`
- rejecting Compose input without a `services` object

**Step 2: Run test to verify RED**

Run: `npm test -- src/tools/docker-run-compose/docker-run-compose.test.ts`

Expected: fail because `src/tools/docker-run-compose/docker-run-compose.ts` does not exist.

---

### Task 2: Implement Compose to Docker Run

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/docker-run-compose/docker-run-compose.ts`
- Test: `/Users/subeipo/Documents/code/toolbox/src/tools/docker-run-compose/docker-run-compose.test.ts`

**Step 1: Write minimal implementation**

Implement:

- `convertComposeToDockerRun(input: string): ConversionResult`
- YAML parsing and `services` validation
- deterministic flag rendering
- scalar/list/map normalization helpers
- shell quoting helper
- lossy conversion warnings

**Step 2: Run GREEN verification**

Run: `npm test -- src/tools/docker-run-compose/docker-run-compose.test.ts`

Expected: Compose-to-run tests pass.

---

### Task 3: Add RED Tests for Docker Run Parsing and Compose Output

**Files:**
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/docker-run-compose/docker-run-compose.test.ts`

**Step 1: Write failing tests**

Add Vitest cases for:

- tokenizing quoted and escaped `docker run` commands
- parsing `--flag value`, `--flag=value`, `-p`, `-e`, `-v`, `-it`, and `--name`
- converting a rich `docker run` command into Compose YAML
- converting multiple run commands into multiple services
- warning for unsupported flags such as `--rm`, `--cidfile`, resource/logging flags, and unknown flags
- rejecting commands that are not `docker run`
- rejecting unterminated quotes

**Step 2: Run test to verify RED**

Run: `npm test -- src/tools/docker-run-compose/docker-run-compose.test.ts`

Expected: fail because run-to-compose conversion is not implemented yet.

---

### Task 4: Implement Docker Run to Compose

**Files:**
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/docker-run-compose/docker-run-compose.ts`
- Test: `/Users/subeipo/Documents/code/toolbox/src/tools/docker-run-compose/docker-run-compose.test.ts`

**Step 1: Write minimal implementation**

Implement:

- `convertDockerRunToCompose(input: string): ConversionResult`
- shell tokenizer with quote/escape errors
- command splitter for multiple `docker run` lines
- long and short flag parser
- Compose service model generation
- YAML output using `stringify`
- warnings for lossy or unsupported flags

**Step 2: Run GREEN verification**

Run: `npm test -- src/tools/docker-run-compose/docker-run-compose.test.ts`

Expected: all converter tests pass.

---

### Task 5: Add Vue Tool UI

**Files:**
- Create: `/Users/subeipo/Documents/code/toolbox/src/tools/docker-run-compose/DockerRunComposeTool.vue`
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/docker-compose/DevOpsYamlTool.vue`

**Step 1: Build UI**

Create a component with:

- direction segmented controls: Compose -> docker run and docker run -> Compose
- sample, clear, convert, and copy actions
- `ToolAnnouncer` live messages
- output textarea and warnings panel
- local-only guidance text

**Step 2: Add suite entry**

Add the new component as a third item inside `DevOpsYamlTool.vue`.

**Step 3: Run smoke build**

Run: `npm run typecheck`

Expected: pass.

---

### Task 6: Register Tool Metadata

**Files:**
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/registry.ts`
- Modify: `/Users/subeipo/Documents/code/toolbox/src/tools/registry.test.ts`

**Step 1: Add registry entry**

Add a standalone tool:

- id: `docker-run-compose`
- title: `Docker Run / Compose 互换`
- path: `/tools/docker-run-compose`
- category: `code`
- group: `DevOps`
- privacy: `local`
- keywords and aliases for Docker, run, compose, container, devops

**Step 2: Add or adjust registry coverage**

Ensure registry tests continue to require explicit privacy and stable route metadata.

**Step 3: Run registry tests**

Run: `npm test -- src/tools/registry.test.ts`

Expected: pass.

---

### Task 7: Add Playwright Coverage

**Files:**
- Modify: `/Users/subeipo/Documents/code/toolbox/tests/ui-polish.spec.ts` or create `/Users/subeipo/Documents/code/toolbox/tests/docker-run-compose.spec.ts`

**Step 1: Write E2E tests**

Cover:

- Compose sample converts to a visible `docker run` command
- docker run sample converts to Compose YAML with `services`
- unsupported fields show warnings
- tool remains discoverable through command palette keywords

**Step 2: Run E2E tests**

Run: `npx playwright test tests/docker-run-compose.spec.ts --project=chromium`

Expected: pass.

---

### Task 8: Full Verification and Commit

**Files:**
- All changed files.

**Step 1: Run full verification**

Run: `npm run verify`

Expected: typecheck, Vitest, production build, and Playwright pass.

**Step 2: Inspect diff**

Run: `git diff --check && git status --short --branch && git diff --stat`

Expected: no whitespace errors and only Docker converter related files changed.

**Step 3: Commit**

Run:

```bash
git add docs/plans/2026-07-08-docker-run-compose-converter-implementation.md src/tools/docker-run-compose src/tools/docker-compose/DevOpsYamlTool.vue src/tools/registry.ts src/tools/registry.test.ts tests/docker-run-compose.spec.ts
git commit -m "feat: add docker run compose converter"
```
