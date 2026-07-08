# Findings

## 2026-07-08

- The review document lists remaining work across privacy/security, accessibility/mobile UX, testing/release, and performance.
- Previous commits already added CI, verify/audit scripts, localhost defaults, dialog privacy label, command palette `aria-pressed`, primary contrast, remote Markdown image hardening, README updates, and PWA `lang`.
- Need inspect current files before deciding which remaining recommendations are still actionable.
- Registry still uses `RegisteredToolDefinition = Omit<ToolDefinition, 'privacy'> & Partial<...>` and fills `privacy` with `tool.privacy ??` plus hard-coded `dns-query` / `websocket-echo`.
- First registry RED test could not run because local `node_modules/entities` is corrupted: expected `dist/commonjs/decode.js` is missing while duplicate directories such as `commonjs 2` exist.
- Privacy/security subagent confirmed shared `ToolPrivacyBadge`, SafeHtmlPreview/sanitizer, crypto warnings, TOTP secret hiding, JWT sample-secret warning, and clipboard warning remain incomplete.
- Accessibility subagent confirmed mobile tool routes still render full sidebar before tool content, skip link/route focus are absent, command filters lack radiogroup semantics, and touch targets are still small.
- Attempted to add `@vitest/coverage-v8@4.1.9`; `npm view` and `npm pack` worked, but adding the provider caused `npm install` / `npm ci --dry-run` to hang during npm ideal-tree resolution around optional Tailwind WASM peer packages. The coverage provider changes were not retained so `npm ci` remains healthy.
- The remaining implementation gaps from the review were closed where they were small and verifiable: explicit privacy metadata and badges, localhost defaults, CI/verify flow, production-preview/PWA/network E2E coverage, Markdown sanitization and remote image hardening, route focus/skip link/mobile navigation, crypto/clipboard guidance, and JSON worker stale-result protection.
- The broad AppShell split, manifest-per-folder registry migration, full worker framework for all heavy tools, and coverage threshold rollout remain roadmap-scale follow-ups; forcing them into this batch would create a much larger migration than the review's immediate hardening path.
