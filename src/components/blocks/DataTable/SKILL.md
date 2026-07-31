---
name: data-tables
description: Choosing a data table variant by data shape, and the configuration areas — columns, pinning, expansion, selection, row interaction, pagination
applies_to: src/components/blocks/DataTable/**, src/components/blocks/*DataTable*/**
---

# Data tables

Tables are `@tanstack/react-table` wrapped by blocks. Feature code never builds a TanStack
instance directly — pick a variant, pass `data` and a `columnConfig`.

## Pick a variant by the shape of your data

| Your data | Variant |
| --- | --- |
| a flat array, short enough to render at once | `SimpleDataTable` |
| a flat array the user moves through a page at a time | `PaginatedDataTable` |
| a flat array long enough that rendering every row is the bottleneck | `VirtualizedDataTable` |
| a **tree** — each row may have child rows | `ExpandableDataTable` |

Three distinctions worth getting right:

- The two long-list variants differ in **UX, not data shape**: `PaginatedDataTable` chunks the list
  behind a pager, `VirtualizedDataTable` keeps one continuous scroll and mounts only visible rows.
- `ExpandableDataTable` is the **only** one that reads a tree. Everything else takes a flat array —
  flatten before you get here.
- **Inline detail under a row is not a tree.** That's `expandedRowProps`, available on any variant.

`DataTable` itself is the low-level primitive these wrap; it wants a built TanStack instance
(`headerGroups`, `numColumns`). Reach for it only when no wrapper can express what you need.

## Configuration areas

Each is opt-in through props. Read the props interface for exact shapes; this is the map of what
exists and which knob turns it on.

### Columns

`columnConfig` — an array of `{ id, header, cell }` plus per-column flags
(`@blocks/DataTable/utils/column`). `cell` receives the whole **row**, not a cell value, and returns
JSX composed from primitives. Headers are translated strings.

Build the config outside the render, as a module-level function or a `useMemo` — a fresh array each
render rebuilds every column def. `InvoiceTable`'s `getColumnConfig` is the pattern.

### Alignment and pinning

Per-column `alignment`, and `pinning` to freeze a column to one side while the rest scrolls
horizontally. Both live on the column entry, not on the table.

### Grouped headers

`NestedColumnConfig` allows a group entry — `{ id, header, columns: [...] }` — in place of a leaf
column, producing a two-tier header. This is about **headers, not rows**; nested rows are the next
section.

### Expansion — two different features

- **Nested rows**: `ExpandableDataTable` with `getSubRows` and `getRowId`. The tree is in your data,
  and rows indent by depth (`indentSize`). `getRowId` must be stable — expansion state is keyed on it.
- **An inline detail panel** beneath a flat row: `expandedRowProps` (`{ render, getRowCanExpand? }`),
  available on any variant. No tree involved.

Reaching for `ExpandableDataTable` when you only wanted a detail panel is the common mistake.

### Selection

`selectionProps` — supplying it **injects the checkbox column**, so don't add one to your column
config. You own the state (`rowSelection`, `onRowSelectionChange`), it needs a translated
`selectAllAriaLabel`, and `enableRowSelection` can be a predicate so only some rows are selectable.

Distinct from `isRowSelected`, which only highlights a row and owns nothing.

### Row interaction

`withClickableRow` makes whole rows a click target. Cells containing their own controls should set
`preventRowClick`, so a row-level click doesn't swallow theirs. `getRowClassName` styles per row.

### Loading, error, and empty states

The table renders these itself from `isLoading` / `isError` plus `slots.EmptyState` /
`slots.ErrorState`. Pass the query's flags straight through — don't wrap a table in
`ConditionalList` or branch on `isLoading` yourself.

### Accessibility

`ariaLabel` on the table, and `isRowHeader` on the column that identifies the row so screen readers
announce it as that row's header. Both are easy to omit and invisible when you do.

## Pagination

Two different things, easy to conflate:

- **Page-index UI** — `@hooks/utils/pagination`: `usePaginationState`, `useTablePaginationProps`,
  `useAutoResetPageIndex` (back to page 1 when filters change), `usePaginatedList` (slice a loaded
  array). This is what `PaginatedDataTable` consumes.
- **Cursor fetching** — `createInfiniteQueryHook`, see [`src/hooks/api/SKILL.md`](../../../hooks/api/SKILL.md).

A screen often uses both: fetch by cursor, display with a pager, bridging them with the query's
`hasMore` / `fetchMore`.

## Related

- [`src/components/SKILL.md`](../../SKILL.md) — component layering and state helpers
- [`src/components/ui/SKILL.md`](../../ui/SKILL.md) — styling and variant conventions these blocks follow
- [`src/utils/i18n/SKILL.md`](../../../utils/i18n/SKILL.md) — formatting cell values
