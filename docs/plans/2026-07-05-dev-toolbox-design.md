# Developer Toolbox Web App Design

## Summary

Build a cross-platform developer toolbox as a static, local-first web app. The app should run entirely in the browser for the initial version, so deployment only requires static assets and does not depend on host operating systems, CPU architecture, native packages, or server runtimes.

## Goals

- Provide common developer utilities in one fast, polished web interface.
- Support static deployment to CDN, object storage, Nginx, GitHub Pages, Cloudflare Pages, Vercel, or Netlify.
- Keep core tools usable offline where possible.
- Avoid backend dependencies in the baseline architecture.
- Keep the codebase easy to extend as new tools are added.

## Non-Goals

- No account system in the first version.
- No server-rendered pages in the first version.
- No native desktop packaging in the first version.
- No platform-specific binaries or native add-ons.

## Chosen Stack

- Vite
- Vue 3
- TypeScript
- Vue Router
- Pinia
- Tailwind CSS
- shadcn-vue and Reka UI
- lucide-vue-next
- VueUse
- Web Workers
- IndexedDB and localStorage
- vite-plugin-pwa
- Vitest
- Playwright

## Rationale

Vite and Vue 3 are a good fit for a static single-page application. Vite gives fast local development and produces plain static build output. Vue 3 keeps the component model approachable, and TypeScript helps keep each utility's input, output, validation, and error contracts explicit.

Vue Router gives each tool a stable route, such as `/json`, `/base64`, `/timestamp`, or `/regex`. Pinia can hold app-wide preferences, favorites, recent tools, theme state, and lightweight session state. Tailwind CSS plus shadcn-vue provides a flexible design foundation without locking the project into a heavy component library. VueUse covers common browser interactions such as clipboard access, persistent state, media queries, dark mode, and keyboard shortcuts.

Web Workers should be used for expensive operations such as large JSON formatting, diffing, compression, hashing, and parsing. This keeps the interface responsive. PWA support makes the app installable and offline-capable while preserving the simple static deployment model.

## Architecture

The app will be a Vite-powered Vue SPA.

- `src/app` contains application shell concerns such as layout, navigation, theme, command palette, and routing.
- `src/tools` contains tool modules. Each tool owns its metadata, route component, pure utility functions, examples, validation, and tests.
- `src/components` contains reusable UI components and shadcn-vue wrappers.
- `src/workers` contains Web Worker entry points for CPU-heavy utilities.
- `src/stores` contains Pinia stores for preferences, favorites, recent tools, and history.
- `src/lib` contains shared helpers, browser storage adapters, formatting helpers, and error utilities.

Tool modules should be registered through a typed metadata list. This keeps navigation, search, favorites, and route generation driven by the same source of truth.

## Initial Tool Set

The first version should focus on practical, frequently used tools:

- JSON formatter and validator
- Base64 encode/decode
- URL encode/decode
- Timestamp converter
- JWT decoder
- Hash generator
- UUID generator
- Regex tester
- Text diff viewer
- Case converter

Each tool should support copy output, clear input, sample input, and visible error states.

## Data Flow

Most tools should use local component state and pure functions. App-level preferences go through Pinia and persist to localStorage. Larger or structured local data can use IndexedDB behind a small storage adapter.

Heavy tools should send input to a Web Worker and receive structured results:

- `ok: true` with computed output and optional metadata
- `ok: false` with a user-facing error message and optional debug details

No user input should leave the browser in the baseline version.

## Error Handling

Tool errors should be handled as normal UI states, not unhandled exceptions. Invalid JSON, malformed JWTs, invalid regex patterns, and decode failures should show concise messages near the relevant input or output area.

Unexpected errors should be caught at the tool boundary and shown as a generic recoverable error. The app shell should include a top-level error boundary-style fallback for route-level failures.

## Testing

Vitest should cover pure utility logic, parser behavior, validation, and worker message handling. Playwright should cover core user flows:

- Navigate between tools.
- Enter input and see output.
- Copy generated output.
- Toggle theme.
- Mark a tool as favorite.
- Reload and confirm persisted preferences.

## Deployment

The production build should output static assets with `vite build`. The app should avoid assumptions about a fixed domain and support configuration for base paths so it can run under GitHub Pages or a subdirectory.

The default deployment target can be Cloudflare Pages or any static host. No server process is required for the baseline.

## Approval

This design was approved by the user on 2026-07-05 with Vue as the required frontend framework.
