# Progress

## 2026-07-08

- Confirmed workspace root is `/Users/subeipo/Documents/code/toolbox` on branch `main`.
- Started read-only subagent audits for privacy/security and accessibility/mobile UX.
- Third subagent spawn hit the current agent limit, so testing/release/performance audit will be done locally.
- Added a registry test for explicit privacy declarations, then hit a dependency startup error before Vitest loaded. Investigating the dependency install before continuing.
- Re-ran the registry test after `npm ci`; it reached test loading but the test path used transformed `import.meta.url`, so I am fixing the test path before validating RED.
- Verified RED for explicit privacy: registry test failed on `Partial<Pick<ToolDefinition, 'privacy'>>` and `privacy ??` fallback.
- Added explicit `privacy` to registered tools, removed fallback type/defaulting, and `npm test -- src/tools/registry.test.ts` now passes 8 tests.
- Added shared `ToolPrivacyBadge` and command filter radio semantics after Playwright RED; targeted `ui-polish` tests now pass for command filtering and DNS privacy badge.
- Hardened Markdown preview with sanitizer tests, `sanitizeMarkdownHtml`, link `target/rel`, dangerous tag/attribute removal, and `SafeHtmlPreview`; Markdown unit test now passes 8 tests.
- Added skip link, route-title focus, mobile Sheet navigation, command filter radio semantics, and mobile touch-target coverage; targeted Playwright checks pass.
- Added crypto/clipboard safety guidance for AES, TOTP, SHA-1 hash/HMAC, JWT signing, and shared action bars; targeted Playwright checks and related unit tests pass.
- Added production-preview Playwright project, PWA SVG icons, manifest/service-worker preview tests, and mocked DNS/WebSocket E2E tests; targeted tests pass.
- Added JSON worker request ids and run-id stale-result guards; JSON unit and E2E tests pass.
- Tried coverage provider integration, but npm dependency resolution hung after adding `@vitest/coverage-v8`; reverted that provider path to preserve `npm ci` and verification stability.
- Fixed the final Playwright failures by separating page-level network status copy from privacy badges, adding visible mobile directory view links, avoiding initial route-focus stealing before the skip link can be tabbed to, and aligning the command palette empty-state test with radiogroup semantics.
- `npm run verify` now passes: `vue-tsc -b`, 107 Vitest files / 320 tests, production `vite build`, and 69 Playwright cases with 61 passed and 8 expected mobile/PWA skips.
