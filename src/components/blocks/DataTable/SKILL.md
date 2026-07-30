---
name: data-tables
description: Choosing and wiring a data table — variant decision table, BaseDataTableProps contract, column config, row behaviour, pagination
applies_to: src/components/blocks/DataTable/**, src/components/blocks/*DataTable*/**
---

# Data tables

Tables are `@tanstack/react-table` wrapped by blocks. Feature code never builds a TanStack
instance directly — it picks a wrapper and passes a column config.

## Pick the narrowest variant that fits

| Component | Use when | Also needs |
| --- | --- | --- |
| `SimpleDataTable` | the default — a flat list that fits on screen | — |
| `PaginatedDataTable` | rows are paged through a pager control | `paginationProps` from `useTablePaginationProps`; `hasMore`/`fetchMore` to drive an infinite query |
| `ExpandableDataTable` | hierarchical rows (report trees, nested accounts) | `NestedColumnConfig`, `getSubRows`, `getRowId`; optional `indentSize`, `onRowExpandToggle` |
| `VirtualizedDataTable` | a list long enough that rendering every row is the bottleneck | an explicit `height` (or `shrinkHeightToFitRows`), plus `rowHeight` / `overscan` |
| `DataTable` | you have already built the TanStack instance yourself | `headerGroups` and `numColumns` |

`DataTable` is the low-level primitive the other four wrap — reach for it only when a wrapper
genuinely can't express what you need, not as the default.

## The shared contract

All of them extend `BaseDataTableProps`:

```tsx
<SimpleDataTable
  componentName='InvoicesTable'
  ariaLabel={t('invoices:label.invoices_table', 'Invoices')}
  isLoading={isLoading}
  isError={isError}
  slots={{ EmptyState, ErrorState }}
  data={data}
  columnConfig={columnConfig}
/>
```

- **The table owns its loading, error, and empty states.** Pass `isLoading`/`isError` and the
  `slots.EmptyState`/`slots.ErrorState` components — don't wrap a table in `ConditionalList`.
- `componentName` drives the generated class names; `ariaLabel` is a **translated** string.
- `dependencies` is forwarded to react-aria's collection components, which cache rendered items.
  If a cell renderer closes over a value outside the row data and the cell goes stale when that
  value changes, list it here to invalidate the cache.

## Columns

`ColumnConfig<TData>` is a plain array of
`{ id, header, cell, alignment?, isRowHeader?, pinning?, preventRowClick? }`
(`@blocks/DataTable/utils/column`). `cell` receives the TanStack `Row`, not the raw value. Define
the config as a module constant or a `useMemo` — never inline in JSX, since a new array each
render rebuilds every column def.

Set `isRowHeader` on the identifying column for screen readers, `pinning` to freeze a column, and
`preventRowClick` on cells holding their own controls so a row-level `onRowClick` doesn't swallow
the click.

Cells are composed from primitives like any other JSX — `<MoneySpan>` for amounts, `<Span>` for
text, `Badge`/`Pill` for status. Headers are translated strings.

## Row behaviour

Opt in through props rather than custom columns:

| Prop | Effect |
| --- | --- |
| `withClickableRow` | `{ onRowClick, isRowClickable }` — row-level click target |
| `selectionProps` | `DataTableSelectionProps` — injects the checkbox column for you |
| `isRowSelected` | highlights a row without owning selection state |
| `getRowClassName` | per-row class, by row and index |
| `expandedRowProps` | inline expanded detail under a row |

Don't hand-roll a checkbox or chevron column when `selectionProps` or `ExpandableDataTable`
covers it.

## Pagination

State lives in `@hooks/utils/pagination`: `usePaginationState`, `useTablePaginationProps`,
`useAutoResetPageIndex` (reset to page 1 when filters change), and `usePaginatedList` for slicing
an already-loaded array.

Keep the two kinds of pagination straight: these hooks drive **page-index UI**, while
`createInfiniteQueryHook` drives **cursor fetching**. A screen often uses both — fetch with
cursors, display with a pager, connecting them through `hasMore`/`fetchMore`. See
[`src/hooks/SKILL.md`](../../../hooks/SKILL.md).

## Related

- [`src/components/SKILL.md`](../../SKILL.md) — component layering and state helpers
- [`src/components/ui/SKILL.md`](../../ui/SKILL.md) — styling and variant conventions these blocks follow
- [`src/utils/i18n/SKILL.md`](../../../utils/i18n/SKILL.md) — formatting cell values
