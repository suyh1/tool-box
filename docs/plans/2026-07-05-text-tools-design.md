# Text Tools Design

## Summary

Add the three remaining planned text utilities to the developer toolbox:

- Case converter
- Regex tester
- Text diff viewer

Each tool should run entirely in the browser, use focused Vue components, keep pure logic in testable TypeScript modules, and follow the existing Chinese UI conventions.

## Goals

- Promote `case`, `regex`, and `diff` from planned tools to active tools.
- Keep all input local to the browser.
- Provide useful output immediately with clear copy, sample, clear, and error states.
- Preserve the current registry-driven routing and navigation model.
- Add unit tests for tool logic and update registry coverage.

## Non-Goals

- No backend processing.
- No account, sync, or persistent tool history.
- No full editor integration or syntax-highlighted editable text areas.
- No regex replacement engine in the first regex version.
- No character-level inline diff in the first diff version.

## Case Converter

The case converter accepts free-form text and converts it into common naming formats:

- `camelCase`
- `PascalCase`
- `snake_case`
- `kebab-case`
- `CONSTANT_CASE`
- `Title Case`

The parser should split on punctuation, whitespace, underscores, hyphens, and camel/Pascal boundaries. Empty input should return empty outputs without throwing. The UI should show all converted formats at once so the user can copy the exact variant they need.

## Regex Tester

The regex tester accepts a pattern, flags, and test text. It compiles the regular expression locally and reports:

- Match count
- Match value
- Match index
- Capturing groups, including named groups when available

Invalid patterns or flags should show a concise Chinese error message. The first version should avoid complex editor highlighting and focus on reliable structured output.

## Text Diff Viewer

The text diff viewer accepts left and right text inputs and produces a line-level diff. It should identify unchanged, added, and removed lines, then display summary counts for each state.

The implementation should use a lightweight local longest common subsequence algorithm. This avoids a new dependency while keeping behavior predictable for typical text snippets. The UI should keep the two inputs side by side on desktop and stack them on small screens.

## Architecture

- `src/tools/case/case.ts` contains case parsing and conversion helpers.
- `src/tools/case/CaseTool.vue` renders the case converter.
- `src/tools/regex/regex.ts` contains regex compilation and match extraction.
- `src/tools/regex/RegexTool.vue` renders the regex tester.
- `src/tools/diff/diff.ts` contains line splitting, LCS diffing, and summary helpers.
- `src/tools/diff/DiffTool.vue` renders the diff viewer.
- `src/tools/registry.ts` imports the three components and marks them `active`.

The app shell, routes, favorites, recent tools, and categories continue to use the existing registry metadata.

## Error Handling

Tool errors should remain local UI states:

- Regex compilation failures show a visible error near the controls.
- Invalid regex flags show a visible error before execution.
- Diff and case conversion should tolerate empty strings and unusual punctuation.
- Unexpected exceptions should be caught at the component boundary where practical and surfaced as recoverable messages.

## Testing

Use Vitest for pure utility behavior:

- Case tokenization and all output formats.
- Regex match extraction, flags, groups, named groups, and invalid inputs.
- Diff added, removed, unchanged, empty input, and repeated lines.
- Registry tests confirming the three tools are active.

Run the existing production build after implementation. Add or adjust Playwright coverage only if the new UI changes affect existing navigation or core flows.

## Approval

The user approved this design on 2026-07-05.
