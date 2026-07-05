# Tool Directory Design

## Summary

Refactor the toolbox navigation from a long tool list into a scalable tool directory system that can support dozens or hundreds of tools.

The current registry already has categories, but the shell still renders every tool in the sidebar. That works for 15 tools and breaks down as the toolbox grows. The new structure separates navigation from discovery:

- Sidebar: high-level navigation, categories, recent, favorites.
- Directory pages: browsing, category overviews, grouped tool lists.
- Command palette: fast jump for users who already know what they want.
- Tool pages: unchanged focused workspaces.

## Goals

- Make the app usable when the registry grows to 100+ tools.
- Avoid rendering a giant sidebar list.
- Add richer registry metadata so future tools can be organized without changing layout code.
- Preserve existing tool routes such as `/tools/json`.
- Add a first-class `/tools` directory route.
- Add category routes such as `/tools/category/format`.
- Keep favorites, recent tools, and command search working.
- Keep the visual language dense, restrained, and task-first.

## Non-Goals

- No backend search service.
- No plugin marketplace or remote catalog.
- No nested tree editor for categories.
- No drag-and-drop customization in this version.
- No per-user custom category management.

## Information Architecture

### Registry Metadata

Extend each tool definition with optional fields:

- `group`: subcategory or functional cluster, such as `JSON / YAML`, `HTTP`, `Database`, or `Text Analysis`.
- `aliases`: alternate names and abbreviations for search, such as `crontab`, `schedule`, or `requests`.
- `featured`: whether a tool should be emphasized in directory overview pages.
- `order`: stable sort value inside category/group sections.

Existing fields remain the source of truth:

- `category`
- `keywords`
- `title`
- `description`
- `path`

### Routes

- `/tools`: main tool directory.
- `/tools/category/:category`: category browser.
- `/tools/:toolId-like-path`: existing tool routes, unchanged.
- `/`: redirect to `/tools`.

### Sidebar

The sidebar becomes a navigation rail rather than a full tool list:

- Directory
- Recent
- Favorites
- Category links with counts

It should not render every tool. This keeps the shell stable when the registry grows.

### Directory Page

The directory page shows:

- A compact search input for browsing.
- Recent tools and favorite tools when available.
- Featured tools.
- Category sections with counts and a small preview list.

The page is meant for discovery, not for doing the work itself.

### Category Page

The category page shows all tools in one category, grouped by `group`. It should support:

- Search within the category.
- Group headings with counts.
- Tool rows/cards with title, description, category code, and keywords.

This is the main scale path for 100+ tools.

### Command Palette

The existing command palette remains a fast jump layer. It should include `aliases` in its search value and keep existing filters.

## Architecture

- `src/tools/catalog.ts` contains category metadata, grouping helpers, sorting helpers, and search matching.
- `src/tools/catalog.test.ts` verifies scalable grouping/search behavior.
- `src/tools/types.ts` adds the new optional metadata fields.
- `src/tools/registry.ts` fills metadata for existing tools.
- `src/tools/catalog/ToolDirectory.vue` renders `/tools`.
- `src/tools/catalog/ToolCategory.vue` renders `/tools/category/:category`.
- `src/app/router.ts` adds directory and category routes before concrete tool routes.
- `src/app/layout/AppShell.vue` changes the sidebar and hero to understand directory/category/tool pages.

## UX Details

- The current tool page layout remains unchanged below the shell hero.
- Tool cards/rows use existing colors, badges, and icons.
- Sidebar category links show label and count.
- Directory and category pages use dense lists rather than decorative card grids.
- Empty states explain whether no tools exist or no search results match.
- Mobile keeps horizontal overflow only for compact nav controls; the directory page handles browsing.

## Error Handling

- Invalid category route redirects to `/tools`.
- Empty recent/favorites sections show compact helpful empty states.
- Search with no results shows an empty state, not a blank page.

## Testing

Use Vitest for catalog logic:

- Category sections are ordered by `categoryOrder`.
- Tools sort by `order` then title.
- Groups are derived from registry metadata.
- Search matches title, description, keywords, and aliases.
- Unknown category returns no section.

Run full unit tests, build, and browser smoke checks for:

- `/tools`
- `/tools/category/format`
- one existing tool route such as `/tools/json`

## Approval

The user approved the scalable directory approach on 2026-07-06.
