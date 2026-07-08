# Project Review: Developer Toolbox

Date: 2026-07-08  
Branch: `main`  
Scope: architecture, security/privacy, testing/release, frontend UX/accessibility/performance

## Executive Summary

Developer Toolbox is in a healthy early-growth state: the tool logic is well covered by unit tests, shared UI primitives exist, the route/registry approach is coherent, and the product already carries a clear local-first positioning.

The main risks are scale and trust boundaries. The project now has about 70 visible tools, roughly 102 tool directories, 336 tool-related files, and a 1519-line central registry. That growth makes registry invariants, privacy metadata, CI gates, and worker boundaries more important than the next individual tool.

No production code was changed during this review. The local dependency tree was rebuilt with `npm ci` after a corrupted `node_modules/yaml` install caused build and E2E failures.

## Verification Performed

- `npm test`: passed, 106 test files and 313 tests.
- `npm run typecheck`: passed.
- `npm audit --audit-level=moderate`: passed, 0 vulnerabilities.
- Initial `npm run build`: failed because local `node_modules/yaml/browser/dist/index.js` was missing.
- `npm pack yaml@2.9.0`: confirmed the published tarball contains the missing browser files.
- `npm ci`: rebuilt local dependencies and restored the missing package files.
- Final `npm run build`: passed.
- Final `npm run test:e2e`: passed, 26 Playwright tests across desktop Chromium and mobile Chrome.

## Priority Findings

### P0: Add CI and a Single Verification Gate

There is no CI configuration and no single `verify` script. `package.json` exposes separate scripts, while `nginx/commands.txt` only documents `npm run build`. This makes it easy to ship without typecheck, unit tests, E2E tests, audit, or a clean install.

Recommended next step:

- Add `npm run verify` that runs `typecheck`, `test`, `build`, and `test:e2e`.
- Add CI with `npm ci`, Playwright browser install, `npm run verify`, and `npm audit --audit-level=moderate`.
- In CI, run Playwright with retries and artifacts.

### P1: Tighten Local-First and Network Privacy Boundaries

The app presents itself as local-first, but dev and preview bind to `0.0.0.0` by default in `package.json`, and the Nginx template listens on port `9010` without limiting to localhost. That conflicts with sensitive-input tools such as JWT, HMAC, TOTP, AES, RSA, CSR, JWK, and SSH.

Recommended next step:

- Make localhost the default for `dev` and `preview`.
- Add explicit `dev:lan` and `preview:lan` scripts for shared LAN use.
- Update product copy to say: "Except tools marked as network-on-action, input is processed in this browser."

### P1: Fix Privacy Metadata and UI Consistency

`registry.ts` defaults privacy with a hard-coded id check for only `dns-query` and `websocket-echo`. The tool dialog then displays `本地可用` for every tool, including network-on-action tools. That weakens user trust.

Recommended next step:

- Require every tool manifest to declare `privacy`.
- Add registry tests that fail when privacy is implicit.
- Create a shared `ToolPrivacyBadge` used in the page header, dialog header, directory cards, and command palette.

### P1: Reduce Registry and Shell Complexity

`src/tools/registry.ts` centralizes tool definitions, merge overrides, legacy redirects, and default privacy. `src/app/layout/AppShell.vue` owns theme, navigation, search, command palette, dialog loading, animation, and large template sections.

Recommended next step:

- Split tool manifests by domain or tool folder and expose them through `defineTool()`.
- Generate route data, redirects, searchable metadata, and typed `ToolId` from the manifest layer.
- Split `AppShell.vue` into `ToolHeader`, `ToolSidebar`, `CommandPalette`, `ToolDialog`, and `useToolNavigation()`.

### P1: Address Frontend Accessibility Issues

Observed issues:

- Light theme primary button contrast is about 3.46:1 for normal text.
- Mobile users opening a tool route must pass through the full sidebar before reaching the tool.
- Route changes do not move focus to the page title or main content.
- Command palette filters rely on visual variants without selected-state semantics.
- Several icon buttons are below comfortable 40-44px touch target size.

Recommended next step:

- Fix light theme primary token contrast first.
- Collapse mobile navigation into a drawer or top-level selector.
- Add a skip link and route-change focus strategy.
- Add `aria-pressed`, tabs, or radiogroup semantics to command palette filters.

### P1: Move Heavy Tools Off the Main Thread

JSON already uses a worker, but other heavy tools still do synchronous work on the main thread. Examples include gzip, Brotli compression, QR decode, Prettier/formatting paths, SQL formatting, and regex matching. Large inputs can block focus, live announcements, progress feedback, and cancellation.

Recommended next step:

- Add a shared worker request pattern with request ids, cancellation, and stale-result protection.
- Move Gzip, Brotli, QR decode, Prettier, SQL, and regex matching into workers over time.
- Add input size guidance and "processing" states for large operations.

### P1: Harden Markdown Preview

Markdown preview disables raw HTML, which is good, but still injects rendered HTML with `v-html`. Future plugins or config changes could widen XSS risk. Markdown images can also trigger remote requests and leak network metadata even when script is blocked.

Recommended next step:

- Wrap `v-html` in a single `SafeHtmlPreview` component.
- Add DOMPurify or an equivalent sanitizer policy before injection.
- Disable remote image rendering by default, or rewrite image tokens to inert text unless the user opts in.
- Add tests for remote images, data URLs, links, and future markdown plugins.

## Testing and Release Improvements

Current strengths:

- Tool pure functions are heavily covered by Vitest.
- Registry invariants already have tests.
- Playwright covers JSON, command palette, privacy labels, favorites/recent nav, live announcements, and clipboard failure behavior.

Gaps:

- No CI.
- No coverage thresholds.
- Playwright runs against the dev server, not production preview.
- PWA manifest has no icons and no explicit `lang`.
- Network tools lack browser-level mocked tests.

Recommended additions:

- `test:coverage` with `@vitest/coverage-v8`, initially scoped to `src/tools/**/*.ts`.
- A production-preview Playwright project that runs `npm run build` and `vite preview --strictPort`.
- Tests for `/manifest.webmanifest`, service worker registration, and installability basics.
- Mocked DNS and WebSocket E2E tests.

## Security and Privacy Improvements

Recommended actions:

- Add an audit script and CI audit gate.
- Keep lockfile-driven installs with `npm ci`.
- Consider Renovate or Dependabot for `markdown-it`, `yaml`, `@peculiar/x509`, `prettier`, `bcryptjs`, `qrcode`, `jsqr`, `fflate`, and `brotli-wasm`.
- Add crypto-tool warnings:
  - AES-GCM IV must never repeat under the same key.
  - TOTP secret should use a hidden input option.
  - SHA-1 is compatibility-only where applicable.
  - JWT signing should not encourage `secret` as a real key.
- Add copy text near clipboard actions: copying writes to the system clipboard and may be readable by other apps.

## Product and UX Strengths

- The local-first positioning is already visible in several tools and tests.
- Shared components such as `ToolPanel`, `ToolTextareaPanel`, `ToolActionBar`, `ToolSuite`, and `ToolAnnouncer` create consistent workflows.
- Most computational logic lives in `.ts` modules with focused tests rather than inside Vue templates.
- The command palette, recent tools, favorites, categories, and legacy redirects are strong usability foundations.
- Reduced-motion handling exists in the shell animation path.

## Suggested Roadmap

### Next 1-2 Days

- Add CI and a `verify` script.
- Fix README and release instructions.
- Make localhost the default host and add explicit LAN scripts.
- Fix the dialog privacy badge for network-on-action tools.
- Fix light-theme primary button contrast.

### Next 1-2 Weeks

- Split `AppShell.vue` into smaller shell components.
- Introduce explicit tool manifests and registry invariant tests.
- Add production-preview Playwright coverage.
- Add PWA icons and `lang: zh-CN`.
- Add mocked E2E tests for DNS and WebSocket.

### Next Month

- Move heavy tools to a shared worker framework.
- Harden Markdown preview with sanitizer and remote-resource controls.
- Add route focus management, skip link, mobile navigation redesign, and touch target cleanup.
- Add coverage thresholds for tool logic and stores.
