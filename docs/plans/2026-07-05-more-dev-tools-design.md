# More Developer Tools Design

## Summary

Add four active utilities to the local developer toolbox:

- YAML / JSON 转换
- Cron 表达式解析
- cURL 转代码
- SQL 格式化

Each tool should run in the browser, follow the existing Chinese product UI conventions, keep core behavior in pure TypeScript modules where practical, and register through the existing metadata-driven route/navigation system.

## Goals

- Cover frequent developer copy/paste workflows beyond encoding and JSON formatting.
- Keep inputs local to the browser.
- Provide reliable feedback, sample input, clear output, and copy behavior.
- Add focused Vitest coverage for each conversion/parser/formatter module.
- Keep the UI consistent with existing tool panels and text areas.

## Non-Goals

- No backend processing or remote validation.
- No exhaustive cURL shell compatibility.
- No full SQL parser or query execution.
- No Quartz cron support in the first Cron version.
- No syntax-highlighting editor dependency.

## YAML / JSON 转换

The tool accepts either JSON or YAML and converts in both directions.

- JSON to YAML parses JSON with `JSON.parse` and serializes with the `yaml` package.
- YAML to JSON parses YAML with the `yaml` package and serializes with two-space JSON.
- Errors show concise Chinese messages.
- Empty input is treated as invalid input with a useful message.

## Cron 表达式解析

The tool accepts standard 5-field cron expressions:

```text
minute hour day-of-month month day-of-week
```

The first version supports:

- Wildcards: `*`
- Steps: `*/15`, `9-17/2`
- Lists: `1,15,30`
- Ranges: `1-5`
- Month and weekday aliases such as `JAN` and `MON`

It outputs the next five execution times from a chosen reference date. Day-of-month and day-of-week follow common cron behavior: if both are restricted, either matching field can trigger the schedule.

## cURL 转代码

The tool accepts common cURL commands and emits starter client code.

Targets:

- Fetch
- Axios
- Python requests

Supported cURL flags:

- `-X`, `--request`
- `-H`, `--header`
- `-d`, `--data`, `--data-raw`, `--data-binary`
- `-u`, `--user`
- URL positional argument

Unsupported flags are ignored where safe. Missing URL returns an error.

## SQL 格式化

The tool accepts SQL and formats or minifies it.

- Formatting uses the `sql-formatter` package.
- The first version supports a compact dialect selector using the package's default SQL behavior.
- Minify removes comments and collapses whitespace for quick sharing.
- Errors show concise Chinese messages.

## Architecture

- `src/tools/yaml-json/yaml-json.ts` and `YamlJsonTool.vue`
- `src/tools/cron/cron.ts` and `CronTool.vue`
- `src/tools/curl/curl.ts` and `CurlTool.vue`
- `src/tools/sql/sql.ts` and `SqlTool.vue`
- `src/tools/registry.ts` registers all four tools as active.
- `src/app/layout/AppShell.vue` adds icons for the new tool ids.

YAML and SQL use small, purpose-built dependencies. Cron and cURL stay dependency-free in the first version.

## Error Handling

- Parser errors return `{ ok: false, message }` from pure modules.
- Vue components show errors using the existing destructive alert pattern.
- Empty output disables copy buttons.
- Unexpected UI exceptions are caught at the action boundary and shown as recoverable messages.

## Testing

Use Vitest for pure modules:

- YAML to JSON and JSON to YAML success and invalid input.
- Cron next execution generation, aliases, invalid field values, and invalid expression length.
- cURL parsing and output generation for method, headers, body, auth, and missing URL.
- SQL format and minify behavior.
- Registry test confirming the new tools are active and discoverable.

Run `npm test`, `npm run build`, and a Playwright smoke script for at least one new route after implementation.

## Approval

The user approved this batch on 2026-07-05.
