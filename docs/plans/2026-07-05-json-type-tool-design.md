# JSON Type Tool Design

## Summary

Add a new active tool, "JSON 转类型", that converts a JSON object or array of objects into common developer type definitions:

- TypeScript interface
- Java class
- Go struct
- Zod schema

The tool should run entirely in the browser, follow the existing Chinese UI conventions, and keep conversion logic in a pure TypeScript module with focused Vitest coverage.

## Goals

- Let developers paste sample JSON and generate useful starter types without leaving the local toolbox.
- Support the most common type targets requested for API payloads and model scaffolding.
- Keep the conversion predictable rather than clever: readable output, stable naming, and clear fallback types.
- Preserve the registry-driven routing, favorites, recent tools, and navigation model.
- Add tests for parser behavior, inference, output generation, and registry metadata.

## Non-Goals

- No backend processing.
- No schema fetching, OpenAPI import, or remote validation.
- No exhaustive language modeling for every type-system edge case.
- No editable AST or field-level override UI in the first version.
- No generated annotations beyond JSON tags for Go.

## Tool Behavior

The tool accepts a JSON object or an array of objects. A root name input defaults to `Root`; invalid or empty names are sanitized into a safe type/class/schema name.

The user chooses one target from a compact native select:

- TypeScript
- Java
- Go
- Zod

Output updates when the user clicks the primary "生成类型" action. The UI also includes sample, clear, and copy output controls, matching the existing toolbox pattern.

## Inference Rules

- Root input must parse as an object or object array.
- Object arrays are merged to infer a single item shape.
- Fields missing from some array items are marked optional where the target supports optionality.
- Null values produce nullable unions or nullable schemas where useful.
- Empty arrays become `unknown[]`, `List<Object>`, `[]any`, or `z.array(z.unknown())`.
- Mixed arrays and incompatible field values fall back to broad safe types.
- Nested objects become separate named types for TypeScript, Java, and Go; Zod uses nested schema constants.
- Field names are preserved in JSON-oriented output, while generated type names and language identifiers are sanitized.

## Target Output

### TypeScript

Generate `interface Root { ... }` and nested interfaces. Primitive types map to `string`, `number`, `boolean`, `null`, and `unknown`. Optional fields use `?`; nullable values use unions such as `string | null`.

### Java

Generate simple POJO-style classes with `private` fields. Primitive wrappers are used for nullable-friendly output: `String`, `Double`, `Boolean`, `Object`, and `List<T>`. Nested objects generate additional classes.

### Go

Generate `type Root struct { ... }` with exported field identifiers and `json:"field"` tags. Primitive types map to `string`, `float64`, `bool`, `any`, and slices.

### Zod

Generate schema constants such as `const RootSchema = z.object({ ... })`. Optional fields use `.optional()`, nullable fields use `.nullable()`, and arrays use `z.array(...)`.

## Architecture

- `src/tools/json-type/json-type.ts` contains parsing, type inference, naming helpers, and target-specific generators.
- `src/tools/json-type/json-type.test.ts` covers pure conversion behavior.
- `src/tools/json-type/JsonTypeTool.vue` renders the tool UI and delegates conversion to the pure module.
- `src/tools/registry.ts` registers the tool as active.
- `src/tools/types.ts` adds a `code` category for code-generation utilities.

The existing app shell, router, sidebar, favorites, and recent tools continue to consume tool metadata from the registry.

## Error Handling

- Invalid JSON returns a concise Chinese error.
- Unsupported root shapes return a clear message asking for an object or object array.
- Empty array roots return a clear message because there is no object shape to infer.
- Unexpected conversion errors are caught in the Vue component and shown as recoverable messages near the action bar.

## UI Notes

The interface should stay task-first and consistent with the current product UI:

- One panel for controls and metadata.
- Two text areas side by side on desktop and stacked on mobile.
- Native select and input controls using the existing token system.
- No decorative motion or extra visual treatment beyond standard control states.

## Testing

Use Vitest for the pure module and registry:

- TypeScript interface generation for nested objects and optional fields.
- Java class generation for nested objects and arrays.
- Go struct generation with JSON tags and sanitized field names.
- Zod schema generation with optional and nullable fields.
- Invalid JSON and invalid root shapes.
- Registry uniqueness and active status with the new tool included.

Run the production build after implementation. Add Playwright coverage only if the new UI affects shared navigation behavior.

## Approval

The user approved this design on 2026-07-05.
