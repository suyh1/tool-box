# Tool Dialog Design

## Goal

Open tools from the directory experience in a large modal dialog so users can browse the growing catalog without losing their place.

## Behavior

- Clicking a tool in the directory, category pages, recent list, favorites list, featured list, quick-entry chips, or command palette opens the tool in a dialog.
- Direct tool URLs such as `/tools/json` keep rendering the full tool page. This preserves refresh recovery and shareable links.
- Closing the dialog returns the user to the same catalog or category view.
- Opening a tool in the dialog records it as recently used.

## UI

- Use the existing dialog system and shared tool components.
- The dialog should be wide and tall enough for existing tool pages, with the tool content scrolling inside the dialog body.
- The header should show tool title, category, group, local availability, and favorite toggle.
- The modal is a task surface, not a marketing layer: restrained styling, familiar controls, no decorative motion.

## Testing

- Add pure logic coverage for deciding when a tool should open in a dialog versus direct route navigation.
- Verify existing tests and production build.
- Smoke test representative catalog clicks in the browser.
