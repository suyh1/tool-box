# Developer Toolbox

Developer Toolbox is a local-first browser toolbox for everyday development tasks: formatting, encoding, decoding, parsing, generating, and inspecting developer data.

The app is built with Vue 3, TypeScript, Vite, Pinia, Tailwind CSS, Vitest, and Playwright. Most tools run entirely in the browser. Tools marked as network-on-action, such as DNS query and WebSocket echo, only connect when the user explicitly triggers that action.

## Requirements

- Node.js 24.x was used for the current review environment.
- npm is expected because the project uses `package-lock.json`.
- Playwright browsers are required before running E2E tests.

## Commands

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Common development commands:

```bash
npm run dev
npm run preview
```

## Verification Notes

Before publishing or handing off changes, run the full verification sequence:

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run test:e2e
```

If Playwright has not been installed on the machine yet, run:

```bash
npx playwright install chromium
```

## Privacy Notes

The baseline product promise is local-first processing. Be precise when adding new tools:

- Mark tools that call `fetch`, `WebSocket`, or other external APIs as network-on-action.
- Add clear user-facing copy when input may leave the browser.
- Avoid processing production secrets on shared devices, remote desktops, or untrusted LAN/HTTP deployments.
