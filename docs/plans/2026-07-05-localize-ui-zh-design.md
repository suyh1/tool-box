# UI Chinese Localization Design

## Summary

Localize the app's user-facing interface text to Simplified Chinese. Keep routing, tool IDs, utility APIs, and project documentation unchanged.

## Scope

- Translate visible app shell labels, badges, button text, placeholders, ARIA labels, tool names, tool descriptions, empty states, metadata labels, and user-facing error messages.
- Preserve technical tokens where Chinese users expect them, including JSON, Base64, URL, JWT, UUID, SHA, ISO, Unix, and Web Crypto API.
- Do not add runtime language switching or an i18n framework.
- Do not translate README, PRODUCT, tests descriptions, internal type names, route paths, or implementation identifiers.

## Approach

Use direct component and registry text replacement. This keeps the change small and matches the user's selected scope: Chinese UI only, not bilingual support.

## Verification

Update UI-focused tests to assert the Chinese text, then run unit tests, end-to-end tests, and the production build.

## Approval

The user approved this design on 2026-07-05.
