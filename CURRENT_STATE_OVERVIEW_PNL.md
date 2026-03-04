# Overview / Reports P&L Working-Tree Handoff (Uncommitted Snapshot)

## Snapshot metadata
- Date: March 3, 2026
- Repository state: local working tree only
- Commit state: **nothing committed, nothing staged**
- Source of truth for this doc: direct output from `git status`, `git diff`, and current untracked file contents in this workspace.

## Addendum — March 3, 2026 (Reports date controls styling follow-up)
- Purpose: align Reports page global date controls closer to deployed UX and fix layout regressions from initial local iteration.
- Files updated in this follow-up:
  - `src/styles/reports.scss`
  - `src/components/ProfitAndLossReport/ProfitAndLossReport.tsx`
  - `src/components/BalanceSheet/BalanceSheet.tsx`
  - `src/components/StatementOfCashFlow/StatementOfCashFlow.tsx`
- Behavior changes:
  - Reports headers now keep date controls/actions aligned in a deployed-like horizontal layout on desktop.
  - Mobile headers keep controls in a single row with scrolling overflow support for the controls region instead of collapsing into awkward wrapped rows.
  - Month mode hides picker labels across Reports surfaces for a tighter control row (`showLabels={mode !== 'month'}`).
  - Header action alignment was corrected so download/expand controls remain visually consistent with deployed behavior across P&L, Balance Sheet, and Cash Flow tabs.
- Validation done in this follow-up:
  - Manual browser verification on `http://localhost:3000/Taylor%20Demo/reports` across desktop and mobile widths.
  - Visual parity checks against `https://demos.layerfi.com/Taylor%20Demo/reports`.
  - `npm run typecheck` passed.
  - `npx lint-staged` could not run in this environment due sandbox restrictions requiring `.git` write access; elevated run was requested and denied.

## Addendum — March 3, 2026 (Overview global picker layout follow-up)
- Purpose: keep the global date picker on Overview while restoring deployed-like header placement (top-right).
- Files updated in this follow-up:
  - `src/views/AccountingOverview/AccountingOverview.tsx`
  - `src/styles/accounting_overview.scss`
- Behavior changes:
  - Overview header now renders `GlobalDateControls` in the top-right region of the page header.
  - Preserved global picker functionality (`Month`/`Custom` modes) on Overview instead of reverting to month-only picker.
  - Added Overview-only header sizing overrides so controls are not clipped by `min-content` header child sizing.
  - Added responsive overflow handling for Overview header controls under narrow widths.
- Validation done in this follow-up:
  - Manual browser verification on `http://localhost:3000/Taylor%20Demo/overview` for desktop and mobile in both month/custom modes.
  - Smoke verification on `http://localhost:3000/Taylor%20Demo/reports` after Overview changes to ensure no regression on Reports layout.
  - `npm run typecheck` passed.
  - `npx lint-staged` could not run in this environment due sandbox restrictions requiring `.git` write access.

## Addendum — March 3, 2026 (Overview stacked controls refinement)
- Purpose: adjust Overview-only global date control UX so `Month | Custom` is always on the first row and date picker fields are on a second row, while keeping controls pinned to the top-right header.
- Files updated in this follow-up:
  - `src/views/AccountingOverview/AccountingOverview.tsx`
  - `src/styles/accounting_overview.scss`
- Behavior changes:
  - Replaced Overview header use of `GlobalDateControls` with an explicit stacked composition:
    - Row 1: `GlobalDateModeToggle`
    - Row 2: `CombinedDateRangeSelection`
  - Kept Overview header placement top-right by using `HeaderCol fluid` + right-aligned stack and Overview view-header sizing overrides.
  - Added fixed desktop control width (`34rem`) so switching from `Custom` to `Month` does not shift the top toggle left.
  - Preserved responsive behavior on small widths with horizontal overflow support for the controls container.
- Validation done in this follow-up:
  - Manual verification on `http://localhost:3000/Taylor%20Demo/overview`:
    - Desktop month mode
    - Desktop custom mode
    - Mobile month mode
    - Mobile custom mode
  - Smoke verification on `http://localhost:3000/Taylor%20Demo/reports` after the Overview refinement.
  - `npm run typecheck` passed.
  - `npx lint-staged` could not run in this environment due sandbox restrictions requiring `.git` write access.

## Addendum — March 3, 2026 (Overview date controls block padding)
- Purpose: add vertical breathing room so the `Month | Custom` row and picker row are not touching the top/bottom of the header controls container.
- Files updated in this follow-up:
  - `src/styles/accounting_overview.scss`
- Behavior changes:
  - Added `padding-block: var(--spacing-2xs)` to `.Layer__AccountingOverview__DateControls`.
- Validation done in this follow-up:
  - Manual verification on `http://localhost:3000/Taylor%20Demo/overview` at desktop and mobile.
  - `npm run typecheck` passed.
  - `npx lint-staged` could not run in this environment due sandbox restrictions requiring `.git` write access.


## Addendum — March 3, 2026 (Staff Review Refactoring)
- Purpose: Address expert frontend review flags from the P&L handoff and apply standard React & SCSS conventions.
- Files updated in this follow-up:
  - `src/views/ProjectProfitability/ProjectProfitability.tsx`
  - `src/providers/GlobalDateStore/GlobalDateStoreProvider.tsx`
  - `src/contexts/ProfitAndLossContext/ProfitAndLossContext.tsx`
  - `src/components/ProfitAndLossHeader/ProfitAndLossHeader.tsx`
  - `src/components/ProfitAndLossHeader/profitAndLossHeader.scss`
  - `src/components/PnLHorizontalBarChart/PnLHorizontalBarChart.tsx`
  - `src/components/PnLHorizontalBarChart/pnLHorizontalBarChart.scss`
  - `src/components/ProfitAndLossChart/ProfitAndLossChartPatternDefs.tsx`
  - `src/styles/profit_and_loss.scss`
  - `src/views/AccountingOverview/AccountingOverview.tsx`
- Behavior changes:
  - Removed cross-view coupling by deleting the global state mutation from `ProjectProfitability` on mount.
  - Decoupled mode-dependent semantics in global actions by adding explicit `setExactDate` and `setExactDateRange` actions.
  - Fixed `ProfitAndLossContext` default setter shape to throw an error rather than fabricating range objects.
  - Added layout constraints (flex properties) to `rightContent` in `ProfitAndLossHeader` to prevent narrow-viewport overlaps.
  - Reverted to standard CSS class definitions over string interpolated styles, restoring inline fills for legend stripe styling.
  - Fixed SVG `<defs>` ID collisions by adding a robust `idPrefix` parameter scheme and CSS classing over explicit ID styling.
  - Replaced `!important` SCSS usages with higher specificity selectors (nested scoping).
  - Renamed the new horizontal widget header to "Revenue & Expenses Breakdown" to avoid duplication.
- Validation done in this follow-up:
  - `npm run typecheck` passed.
  - Linter check passed via `ReadLints`.

## Addendum — March 3, 2026 (Isolate dateSelectionMode from global store in useProfitAndLoss)
- Purpose: Prevent the Reports page from contaminating the global date mode. When the user is in Monthly mode on Overview, navigates to Reports (which uses 'full' mode), and comes back, the Overview should still be in Monthly mode.
- Files updated in this follow-up:
  - `src/hooks/useProfitAndLoss/useProfitAndLoss.tsx`
- Behavior changes:
  - `useProfitAndLoss` no longer writes to the global `dateMode` store. Instead, `setDateSelectionMode` sets a local state override (`localModeOverride`) that only persists for the lifetime of the mounted ProfitAndLoss provider.
  - The effective `dateSelectionMode` is `localModeOverride ?? globalDateSelectionMode`. This means: on Overview, the global mode (from the toggle) drives the context; on Reports, the local override (`'full'` from the `useEffect`) drives the context.
  - When navigating from Reports back to Overview, the global mode is untouched. If it was 'month', Overview stays in Monthly mode, with the month anchored to the end date from the global store.
  - When navigating from a Custom-mode Overview to Reports and back, the global mode stays 'full', so Overview stays in Custom mode.
  - Removed `useGlobalDateModeActions` import from `useProfitAndLoss` since it is no longer needed.
- Validation done in this follow-up:
  - `npm run typecheck` passed.
  - Linter check passed via `ReadLints`.

## Addendum — March 3, 2026 (Remove Month/Custom toggle from Reports pages)
- Purpose: Revert all Reports-page component and styling changes related to the global date mode toggle. The Month/Custom toggle should only exist on the Accounting Overview page.
- Files reverted to HEAD in this follow-up:
  - `src/components/ProfitAndLossReport/ProfitAndLossReport.tsx`
  - `src/components/BalanceSheet/BalanceSheet.tsx`
  - `src/components/StatementOfCashFlow/StatementOfCashFlow.tsx`
  - `src/views/Reports/Reports.tsx`
  - `src/styles/reports.scss`
- Files updated in this follow-up:
  - `src/hooks/useProfitAndLoss/useProfitAndLoss.tsx` — wrapped `setDateMode` in a backward-compatible `setDateSelectionMode` callback that accepts a plain `DateSelectionMode` string, matching the original consumer signature in `ProfitAndLossReport.tsx`.
- Behavior changes:
  - Reports pages (Profit & Loss, Balance Sheet, Statement of Cash Flow) no longer render the `GlobalDateControls` or `GlobalDateModeToggle`. They use their original date pickers as committed.
  - Reports still use global date range state: changing the date range on a Reports page updates the global store. The `dateSelectionMode` passed to each report (defaulting to `'full'`) is forwarded to the global store so the date range is correctly scoped.
  - The Month/Custom toggle is only available on the Accounting Overview page.
  - The shared report header utility classes (`.Layer__ReportsHeaderRow`, etc.) in `reports.scss` have been reverted to the original minimal styles.
- Validation done in this follow-up:
  - `npm run typecheck` passed.
  - Linter check passed via `ReadLints`.

## Addendum — March 3, 2026 (Custom-mode Overview UX refinements)
- Purpose: Improve the custom date-range experience on the Accounting Overview page by hiding redundant summary banners, adding Net Profit to the horizontal bar chart, merging bar rows into a single visual container, and adding a transactions CTA.
- Files updated in this follow-up:
  - `src/views/AccountingOverview/AccountingOverview.tsx`
  - `src/components/PnLHorizontalBarChart/PnLHorizontalBarChart.tsx`
  - `src/components/PnLHorizontalBarChart/pnLHorizontalBarChart.scss`
  - `src/components/ProfitAndLossSummaries/ProfitAndLossSummaries.tsx`
  - `REVIEW_FILE_JUSTIFICATIONS.md`
- Behavior changes:
  - When toggling to Custom mode on the Accounting Overview, the four top-level summary banners (Revenue, Expenses, Net Profit, Transactions to Review) are now hidden. They remain visible in Month mode.
  - Reverted the `showPercentageChanges` prop from `ProfitAndLossSummaries` — since the summaries are only rendered in month mode, conditional percentage suppression is unnecessary dead code.
  - Added a "Net Profit" label + `MoneySpan` amount directly under the header date-range line inside the horizontal bar chart.
  - Revenue and Expenses bar rows are now rendered inside a single shared container (`Layer__PnLHorizontalBarChart__bars-container`) with one border/gradient background, separated internally by a top border on the second row.
  - Added a "Review transactions" CTA (`TextButton` + `ChevronRight` icon) at the bottom-right of the horizontal bar chart, wired to `onTransactionsToReviewClick`.
- Validation done in this follow-up:
  - `npm run typecheck` passed.
  - Linter check passed via `ReadLints`.

## Update protocol (mandatory)
- Every future update by any agent that changes this workstream must be recorded in this file in the same session.
- Do not leave changes undocumented: modified files, new files, behavior changes, and known caveats must all be appended or revised here.
- Before handoff or pausing work, re-check `git status` and ensure this file reflects the exact current working tree.

## Scope and intent
This document is intentionally exhaustive for the current unstaged state so reviewers and follow-on agents can account for every changed line. It includes:
- exact file inventory
- exact tracked-file diff
- full content of each untracked implementation file
- reviewer-focused caveats and concerning patterns

## Current objective represented by this working tree
- Promote date mode (`month` vs `full/custom`) to a global state concern.
- Unify date controls across Overview, Reports, and Project Profitability report views.
- Plumb transaction counts through P&L report API schema/request/response and consume those counts from shared context.
- Add and iterate on Overview `PnLHorizontalBarChart`.
- Align `PnLHorizontalBarChart` legend/palette with legacy P&L chart behavior and place the legend at the `Profit & Loss` header level.

## Files currently changed (tracked + untracked)
This section is machine-captured from `git status --short` at doc generation time.

```text
A  CURRENT_STATE_OVERVIEW_PNL.md
M  src/components/BalanceSheet/BalanceSheet.tsx
M  src/components/DateSelection/CombinedDateRangeSelection.tsx
M  src/components/DateSelection/CombinedDateSelection.tsx
A  src/components/DateSelection/GlobalDateControls.tsx
A  src/components/DateSelection/GlobalDateModeToggle.tsx
A  src/components/DateSelection/globalDateControls.scss
AM src/components/PnLHorizontalBarChart/PnLHorizontalBarChart.tsx
AM src/components/PnLHorizontalBarChart/pnLHorizontalBarChart.scss
 M src/components/ProfitAndLossChart/ProfitAndLossChartPatternDefs.tsx
MM src/components/ProfitAndLossHeader/ProfitAndLossHeader.tsx
 M src/components/ProfitAndLossHeader/profitAndLossHeader.scss
M  src/components/ProfitAndLossReport/ProfitAndLossReport.tsx
M  src/components/ProfitAndLossSummaries/ProfitAndLossSummaries.tsx
M  src/components/StatementOfCashFlow/StatementOfCashFlow.tsx
MM src/contexts/ProfitAndLossContext/ProfitAndLossContext.tsx
M  src/hooks/useProfitAndLoss/schemas.ts
M  src/hooks/useProfitAndLoss/useProfitAndLoss.tsx
M  src/hooks/useProfitAndLoss/useProfitAndLossReport.tsx
M  src/hooks/useProfitAndLossComparison/useProfitAndLossComparison.tsx
MM src/providers/GlobalDateStore/GlobalDateStoreProvider.tsx
M  src/styles/accounting_overview.scss
 M src/styles/profit_and_loss.scss
M  src/styles/reports.scss
MM src/views/AccountingOverview/AccountingOverview.tsx
M  src/views/AccountingOverview/internal/TransactionsToReview.tsx
MM src/views/ProjectProfitability/ProjectProfitability.tsx
M  src/views/Reports/Reports.tsx
?? generate_handoff.js
```

## Diff statistics
```text
 .../PnLHorizontalBarChart.tsx                      | 30 ++++++++-------
 .../pnLHorizontalBarChart.scss                     | 43 ++++++++--------------
 .../ProfitAndLossChartPatternDefs.tsx              | 15 ++++++--
 .../ProfitAndLossHeader/ProfitAndLossHeader.tsx    |  6 ++-
 .../ProfitAndLossHeader/profitAndLossHeader.scss   |  5 +++
 .../ProfitAndLossContext/ProfitAndLossContext.tsx  |  8 ++--
 .../GlobalDateStore/GlobalDateStoreProvider.tsx    | 21 ++++++++++-
 src/styles/profit_and_loss.scss                    |  4 ++
 .../AccountingOverview/AccountingOverview.tsx      |  2 +-
 .../ProjectProfitability/ProjectProfitability.tsx  |  8 +---
 10 files changed, 82 insertions(+), 60 deletions(-)
```


This section is machine-captured from `git status --short` at doc generation time.

```text
 M src/components/BalanceSheet/BalanceSheet.tsx
 M src/components/DateSelection/CombinedDateRangeSelection.tsx
 M src/components/DateSelection/CombinedDateSelection.tsx
 M src/components/ProfitAndLossHeader/ProfitAndLossHeader.tsx
 M src/components/ProfitAndLossReport/ProfitAndLossReport.tsx
 M src/components/ProfitAndLossSummaries/ProfitAndLossSummaries.tsx
 M src/components/StatementOfCashFlow/StatementOfCashFlow.tsx
 M src/contexts/ProfitAndLossContext/ProfitAndLossContext.tsx
 M src/hooks/useProfitAndLoss/schemas.ts
 M src/hooks/useProfitAndLoss/useProfitAndLoss.tsx
 M src/hooks/useProfitAndLoss/useProfitAndLossReport.tsx
 M src/hooks/useProfitAndLossComparison/useProfitAndLossComparison.tsx
 M src/providers/GlobalDateStore/GlobalDateStoreProvider.tsx
 M src/styles/accounting_overview.scss
 M src/styles/reports.scss
 M src/views/AccountingOverview/AccountingOverview.tsx
 M src/views/AccountingOverview/internal/TransactionsToReview.tsx
 M src/views/ProjectProfitability/ProjectProfitability.tsx
 M src/views/Reports/Reports.tsx
?? CURRENT_STATE_OVERVIEW_PNL.md
?? src/components/DateSelection/GlobalDateControls.tsx
?? src/components/DateSelection/GlobalDateModeToggle.tsx
?? src/components/DateSelection/globalDateControls.scss
?? src/components/PnLHorizontalBarChart/PnLHorizontalBarChart.tsx
?? src/components/PnLHorizontalBarChart/pnLHorizontalBarChart.scss
```

## Diff statistics
```text
 src/components/BalanceSheet/BalanceSheet.tsx       | 38 +++++++++--
 .../DateSelection/CombinedDateRangeSelection.tsx   |  9 ++-
 .../DateSelection/CombinedDateSelection.tsx        |  9 ++-
 .../ProfitAndLossHeader/ProfitAndLossHeader.tsx    |  5 +-
 .../ProfitAndLossReport/ProfitAndLossReport.tsx    | 43 ++++++++----
 .../ProfitAndLossSummaries.tsx                     | 20 +++++-
 .../StatementOfCashFlow/StatementOfCashFlow.tsx    | 26 ++++++--
 .../ProfitAndLossContext/ProfitAndLossContext.tsx  |  6 +-
 src/hooks/useProfitAndLoss/schemas.ts              | 25 +++++++
 src/hooks/useProfitAndLoss/useProfitAndLoss.tsx    |  8 ++-
 .../useProfitAndLoss/useProfitAndLossReport.tsx    | 18 ++++-
 .../useProfitAndLossComparison.tsx                 |  2 +-
 .../GlobalDateStore/GlobalDateStoreProvider.tsx    | 76 +++++++++++++++-------
 src/styles/accounting_overview.scss                | 36 ++++++++++
 src/styles/reports.scss                            | 34 ++++++++++
 .../AccountingOverview/AccountingOverview.tsx      | 34 +++++++++-
 .../internal/TransactionsToReview.tsx              | 45 +++----------
 .../ProjectProfitability/ProjectProfitability.tsx  | 16 ++++-
 src/views/Reports/Reports.tsx                      | 18 +++--
 19 files changed, 359 insertions(+), 109 deletions(-)
```

## Detailed change log by file

### 1) `src/providers/GlobalDateStore/GlobalDateStoreProvider.tsx`
- `GlobalDateState` changed from `DateRange` to `DateRange & { dateMode: DateSelectionMode }`.
- Added store action `setDateMode({ dateMode })` and exposed it through `useGlobalDateRangeActions`.
- Added hooks:
  - `useGlobalDateMode()`
  - `useGlobalDateModeActions()`
- `buildStore` now uses `get` to read current `dateMode` in `setDate` and `setDateRange`, so range derivation depends on mode.
- `setDateMode` behavior:
  - on `month`: anchors to existing `endDate` month (`{ startDate: endDate, endDate }`), then applies mode range transform.
  - on other modes: applies transform to existing range.
- Initial state now includes `dateMode: 'month'`.

### 2) `src/components/DateSelection/GlobalDateModeToggle.tsx` (new)
- New reusable toggle for global mode (`Month` vs `Custom`).
- Reads mode from `useGlobalDateMode`, writes with `useGlobalDateModeActions().setDateMode`.
- Restricts outgoing values to `'month' | 'full'`.

### 3) `src/components/DateSelection/GlobalDateControls.tsx` (new)
- New wrapper component to render:
  - `GlobalDateModeToggle`
  - either `CombinedDateRangeSelection` (`selectionType='range'`) or `CombinedDateSelection` (`selectionType='single'`)
- Supports props `mode`, `showLabels`, `truncateMonth`, `selectionType`, `className`.
- Applies mode/type CSS classes used by shared styling.

### 4) `src/components/DateSelection/globalDateControls.scss` (new)
- Adds grid-based layout rules for combined mode toggle + picker area.
- Adds max width handling for range (`34rem`) and single (`24rem`) selection variants.
- Constrains month input width and collapses layout at breakpoints (`1200px`, `768px`).

### 5) `src/components/DateSelection/CombinedDateRangeSelection.tsx`
- Added optional `truncateMonth?: boolean` prop.
- Passes `truncateMonth` to `GlobalMonthPicker` when in month mode.

### 6) `src/components/DateSelection/CombinedDateSelection.tsx`
- Added optional `truncateMonth?: boolean` prop.
- Passes `truncateMonth` to `GlobalMonthPicker` when in month mode.

### 7) `src/views/Reports/Reports.tsx`
- Reads global mode via `useGlobalDateMode()`.
- Extends `ReportsPanelProps` with required `dateSelectionMode`.
- Passes `dateSelectionMode` into `ReportsPanel` and then into:
  - `ProfitAndLossReport`
  - `BalanceSheet`
  - `StatementOfCashFlow`
- Wraps report-type toggle in `HStack` with header action classing.

### 8) `src/components/ProfitAndLossReport/ProfitAndLossReport.tsx`
- Replaced `CombinedDateRangeSelection` with `GlobalDateControls`.
- Uses context `dateSelectionMode` as fallback when prop is not provided.
- `dateSelectionMode` prop is now optional (no default assignment in destructure).
- Effect now only syncs when prop is explicitly passed.
- Header layout updated to shared report classes:
  - `Layer__ReportsHeaderRow`
  - `Layer__ReportsHeaderPrimary`
  - `Layer__ReportsDateControls`
  - `Layer__ReportsHeaderActions`

### 9) `src/components/BalanceSheet/BalanceSheet.tsx`
- Replaced `CombinedDateSelection` with `GlobalDateControls` using `selectionType='single'`.
- Added report header wrapper classes for responsive layout.
- Wrapped expand button area in `Layer__ReportsHeaderActions`.

### 10) `src/components/StatementOfCashFlow/StatementOfCashFlow.tsx`
- Replaced `CombinedDateRangeSelection` with `GlobalDateControls`.
- Added report header wrapper classes.
- Wrapped download button area in `Layer__ReportsHeaderActions`.

### 11) `src/styles/reports.scss`
- Added report-header utility classes and responsive behavior:
  - `.Layer__ReportsHeaderRow`
  - `.Layer__ReportsHeaderPrimary`
  - `.Layer__ReportsDateControls`
  - `.Layer__ReportsHeaderActions`
- Adds container breakpoint behavior at `1120px` for action row wrapping/right alignment.

### 12) `src/hooks/useProfitAndLoss/schemas.ts`
- Request schema adds optional `includeTransactionCounts`.
- Adds `TransactionCountsSchema` mapping snake_case API keys to camelCase.
- P&L response schema adds optional `transactionCounts` from `transaction_counts`.

### 13) `src/hooks/useProfitAndLoss/useProfitAndLossReport.tsx`
- Adds `includeTransactionCounts` to SWR key (`buildKey`).
- Adds `includeTransactionCounts` to request query params.
- Hook signature now accepts and forwards `includeTransactionCounts`.

### 14) `src/hooks/useProfitAndLoss/useProfitAndLoss.tsx`
- Removes local date mode state.
- Uses global mode hooks:
  - `useGlobalDateMode()`
  - `useGlobalDateModeActions()`
- Adds `includeTransactionCounts: true` to `useProfitAndLossReport` invocation.

### 15) `src/contexts/ProfitAndLossContext/ProfitAndLossContext.tsx`
- Default `setDateSelectionMode` no-op signature changed to accept `{ dateMode }` and return a range-like object.

### 16) `src/hooks/useProfitAndLossComparison/useProfitAndLossComparison.tsx`
- Range source changed from hardcoded month mode to current context `dateSelectionMode`.

### 17) `src/views/AccountingOverview/internal/TransactionsToReview.tsx`
- Removed independent summaries hook and month matching logic.
- Removed `tagFilter` prop from component API.
- Now reads counts from `ProfitAndLossContext.data.transactionCounts`.
- Refresh now calls context `refetch`.

### 18) `src/components/ProfitAndLossSummaries/ProfitAndLossSummaries.tsx`
- Added `showPercentageChanges?: boolean` prop (default `true`).
- When false, percent-change values + comparison month are explicitly nulled while amounts are still populated.

### 19) `src/views/ProjectProfitability/ProjectProfitability.tsx`
- Syncs incoming `dateSelectionMode` prop to global store via `useEffect` and `setDateMode`.
- Reads `globalDateSelectionMode` and passes it into `ProfitAndLoss.Report`.

### 20) `src/styles/accounting_overview.scss`
- Adds date-control and header layout classes for overview header stack behavior.
- Adds `.Layer__AccountingOverviewView` header/grid normalization.
- Adds container query (`max-width: 960px`) for date selection collapse.

### 21) `src/views/AccountingOverview/AccountingOverview.tsx`
- Replaces single month picker with stacked controls:
  - `GlobalDateModeToggle`
  - `CombinedDateRangeSelection`
- Reads date mode from global store.
- Adds `viewClassName='Layer__AccountingOverviewView'`.
- Passes `showPercentageChanges={dateSelectionMode === 'month'}` to summaries.
- Adds new container `name='PnLHorizontalBarChart'` with:
  - `ProfitAndLoss.Header text='Profit & Loss' rightContent={<PnLHorizontalBarChartLegend />}`
  - `<PnLHorizontalBarChart />`

### 22) `src/components/ProfitAndLossHeader/ProfitAndLossHeader.tsx`
- Adds optional `rightContent?: ReactNode` prop.
- Renders `rightContent` before date/download actions in trailing `HStack`.

### 23) `src/components/PnLHorizontalBarChart/PnLHorizontalBarChart.tsx` (new)
- Adds new Overview chart for categorized vs uncategorized Revenue/Expenses.
- Uses `ProfitAndLossContext` values and `transactionCounts`.
- Uses global date mode/range for displayed date span.
- Badge behavior:
  - Warning + bell when uncategorized > 0.
  - Success + check when fully categorized.
- Bar behavior:
  - vertical layout stacked bars
  - categorized amount emphasized
  - uncategorized stripe fill
  - animation disabled
- Reuses legacy stripe defs from `ProfitAndLossChartPatternDefs`.
- Aligns categorized colors to legacy palette tokens:
  - revenue: `var(--bar-color-income)`
  - expenses: `var(--bar-color-expenses)`
- Exports reusable `PnLHorizontalBarChartLegend`.
- Legend is no longer rendered inside chart body; intended placement is external (header-level).

### 24) `src/components/PnLHorizontalBarChart/pnLHorizontalBarChart.scss` (new)
- Adds styling for chart layout/cards/bar tracks/status/legend typography.
- Legend class styles mimic legacy legend text sizing and fill classes.
- Uses palette variables; no hardcoded hex values.
- Includes mobile container-query alignment overrides with `!important` to enforce stack alignment.

### 25) `CURRENT_STATE_OVERVIEW_PNL.md` (this file, new)
- Rewritten to accurately reflect the current working tree and include full machine-captured artifacts.

## Latest delta vs earlier handoff state (important)
The previous handoff content was stale in these ways and is corrected here:
- `src/components/ProfitAndLossHeader/ProfitAndLossHeader.tsx` is now modified and included.
- Legend behavior for `PnLHorizontalBarChart` changed from local-in-chart placement to header-level placement using `ProfitAndLoss.Header rightContent`.
- `PnLHorizontalBarChart` no longer uses the earlier hardcoded hex palette from the old draft; it now uses legacy palette variables/pattern defs.
- Removed mention of untracked `profit-and-loss-transaction-counts-handoff.md` because it is not currently present in `git status`.

## Concerning patterns / review flags for expert frontend review
These are not blockers by default, but should be intentionally reviewed:

1. No targeted tests added with this set
- Behavioral changes are broad (global state, query params, context data dependencies).
- No new unit/integration coverage in this working tree to lock expected behavior.

## Validation run in this session
- `npm run typecheck` passed.
- No additional automated test suites were run in this pass.
- No stylelint run in this pass.
- No browser automation verification run in this pass.

## Exact tracked-file diff (machine-captured)

```diff
diff --git a/src/components/PnLHorizontalBarChart/PnLHorizontalBarChart.tsx b/src/components/PnLHorizontalBarChart/PnLHorizontalBarChart.tsx
index b2d478ef..2329c3ea 100644
--- a/src/components/PnLHorizontalBarChart/PnLHorizontalBarChart.tsx
+++ b/src/components/PnLHorizontalBarChart/PnLHorizontalBarChart.tsx
@@ -1,4 +1,5 @@
 import { useContext, useMemo } from 'react'
+import classNames from 'classnames'
 import { format } from 'date-fns'
 import {
   Bar,
@@ -11,16 +12,16 @@ import {
 import { centsToDollars } from '@models/Money'
 import { useGlobalDateMode, useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
 import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
-import {
-  ProfitAndLossChartPatternDefs,
-  STRIPE_PATTERN_DARK_FILL,
-  STRIPE_PATTERN_FILL,
-} from '@components/ProfitAndLossChart/ProfitAndLossChartPatternDefs'
-import { HStack, VStack } from '@ui/Stack/Stack'
-import { Span } from '@ui/Typography/Text'
 import BellIcon from '@icons/Bell'
 import CheckIcon from '@icons/Check'
+import { HStack, VStack } from '@ui/Stack/Stack'
+import { Span } from '@ui/Typography/Text'
 import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'
+import {
+  getStripePatternDarkFill,
+  getStripePatternFill,
+  ProfitAndLossChartPatternDefs,
+} from '@components/ProfitAndLossChart/ProfitAndLossChartPatternDefs'
 
 import './pnLHorizontalBarChart.scss'
 
@@ -53,7 +54,7 @@ const PNL_HORIZONTAL_BAR_CHART_LEGEND_PAYLOAD = [
   {
     value: 'Uncategorized',
     className: 'Layer__PnLHorizontalBarChart__legend-item--uncategorized',
-    fill: STRIPE_PATTERN_DARK_FILL,
+    fill: getStripePatternDarkFill('horizontal-bar-legend'),
   },
 ]
 
@@ -75,12 +76,15 @@ type PnLHorizontalBarChartLegendProps = {
 }
 
 export const PnLHorizontalBarChartLegend = ({ className }: PnLHorizontalBarChartLegendProps) => (
-  <HStack className={`Layer__PnLHorizontalBarChart__legend Layer__chart-legend-list ${className ?? ''}`.trim()}>
+  <HStack className={classNames('Layer__PnLHorizontalBarChart__legend Layer__chart-legend-list', className)}>
+    <svg width='0' height='0' style={{ position: 'absolute' }}>
+      <ProfitAndLossChartPatternDefs idPrefix='horizontal-bar-legend' />
+    </svg>
     {PNL_HORIZONTAL_BAR_CHART_LEGEND_PAYLOAD.map(item => (
       <HStack
         key={item.value}
         align='center'
-        className={`recharts-legend-item ${item.className}`}
+        className={classNames('recharts-legend-item', item.className)}
       >
         <LegendIcon fill={item.fill} />
         <Span className='recharts-legend-item-text'>{item.value}</Span>
@@ -114,7 +118,7 @@ export const PnLHorizontalBarChart = () => {
       uncategorizedTransactionCount: transactionCounts?.uncategorizedInflows,
       total: categorizedRevenue + uncategorizedRevenue,
       categorizedColor: CATEGORIZED_REVENUE_COLOR,
-      uncategorizedColor: STRIPE_PATTERN_FILL,
+      uncategorizedColor: getStripePatternFill(`horizontal-bar-${'income'}`),
     }, {
       id: 'expenses',
       label: 'Expenses',
@@ -123,7 +127,7 @@ export const PnLHorizontalBarChart = () => {
       uncategorizedTransactionCount: transactionCounts?.uncategorizedOutflows,
       total: categorizedExpenses + uncategorizedExpenses,
       categorizedColor: CATEGORIZED_EXPENSES_COLOR,
-      uncategorizedColor: STRIPE_PATTERN_DARK_FILL,
+      uncategorizedColor: getStripePatternDarkFill(`horizontal-bar-${'expenses'}`),
     }]
   }, [
     profitAndLossData?.costOfGoodsSold?.value,
@@ -180,7 +184,7 @@ export const PnLHorizontalBarChart = () => {
             <HStack className='Layer__PnLHorizontalBarChart__bar-wrapper'>
               <ResponsiveContainer width='100%' height={BAR_CHART_HEIGHT}>
                 <BarChart data={[item]} layout='vertical' className='Layer__PnLHorizontalBarChart__chart'>
-                  <ProfitAndLossChartPatternDefs />
+                  <ProfitAndLossChartPatternDefs idPrefix={`horizontal-bar-${item.id}`} />
                   <XAxis type='number' hide domain={[0, maxTotal]} />
                   <YAxis type='category' dataKey='label' hide />
                   <Bar
diff --git a/src/components/PnLHorizontalBarChart/pnLHorizontalBarChart.scss b/src/components/PnLHorizontalBarChart/pnLHorizontalBarChart.scss
index 5637fdf8..30322a97 100644
--- a/src/components/PnLHorizontalBarChart/pnLHorizontalBarChart.scss
+++ b/src/components/PnLHorizontalBarChart/pnLHorizontalBarChart.scss
@@ -72,22 +72,9 @@
 }
 
 .Layer__PnLHorizontalBarChart__legend .recharts-legend-item {
-  fill: var(--bar-color-income);
   align-items: center;
 }
 
-.Layer__PnLHorizontalBarChart__legend-item--income {
-  fill: var(--bar-color-income);
-}
-
-.Layer__PnLHorizontalBarChart__legend-item--expenses {
-  fill: var(--bar-color-expenses);
-}
-
-.Layer__PnLHorizontalBarChart__legend-item--uncategorized {
-  fill: var(--base-transparent-16-light);
-}
-
 .Layer__PnLHorizontalBarChart__legend .recharts-legend-item-text {
   font-size: 12px;
   color: var(--color-base-700);
@@ -103,21 +90,21 @@
 @container (max-width: 720px) {
   .Layer__PnLHorizontalBarChart {
     padding: var(--spacing-sm);
-  }
-
-  .Layer__PnLHorizontalBarChart__header {
-    flex-direction: column !important;
-    align-items: flex-start !important;
-  }
-
-  .Layer__PnLHorizontalBarChart__row-header {
-    flex-direction: column !important;
-    align-items: flex-start !important;
-  }
 
-  .Layer__PnLHorizontalBarChart__status-group {
-    align-items: flex-start !important;
-    width: 100%;
-    text-align: left;
+    .Layer__PnLHorizontalBarChart__header {
+      flex-direction: column;
+      align-items: flex-start;
+    }
+
+    .Layer__PnLHorizontalBarChart__row-header {
+      flex-direction: column;
+      align-items: flex-start;
+    }
+
+    .Layer__PnLHorizontalBarChart__status-group {
+      align-items: flex-start;
+      width: 100%;
+      text-align: left;
+    }
   }
 }
diff --git a/src/components/ProfitAndLossChart/ProfitAndLossChartPatternDefs.tsx b/src/components/ProfitAndLossChart/ProfitAndLossChartPatternDefs.tsx
index 6f9fe4e3..da210a47 100644
--- a/src/components/ProfitAndLossChart/ProfitAndLossChartPatternDefs.tsx
+++ b/src/components/ProfitAndLossChart/ProfitAndLossChartPatternDefs.tsx
@@ -1,12 +1,19 @@
 export const STRIPE_PATTERN_ID = 'layer-bar-stripe-pattern'
 export const STRIPE_PATTERN_DARK_ID = 'layer-bar-stripe-pattern-dark'
 
+export const getStripePatternId = (idPrefix?: string) => idPrefix ? `${idPrefix}-${STRIPE_PATTERN_ID}` : STRIPE_PATTERN_ID
+export const getStripePatternDarkId = (idPrefix?: string) => idPrefix ? `${idPrefix}-${STRIPE_PATTERN_DARK_ID}` : STRIPE_PATTERN_DARK_ID
+
 export const STRIPE_PATTERN_FILL = `url(#${STRIPE_PATTERN_ID})`
 export const STRIPE_PATTERN_DARK_FILL = `url(#${STRIPE_PATTERN_DARK_ID})`
 
-const StripePattern = ({ id }: { id: string }) => (
+export const getStripePatternFill = (idPrefix?: string) => `url(#${getStripePatternId(idPrefix)})`
+export const getStripePatternDarkFill = (idPrefix?: string) => `url(#${getStripePatternDarkId(idPrefix)})`
+
+const StripePattern = ({ id, variant = 'light' }: { id: string, variant?: 'light' | 'dark' }) => (
   <pattern
     id={id}
+    className={`Layer__stripe-pattern--${variant}`}
     x='0'
     y='0'
     width='4'
@@ -19,9 +26,9 @@ const StripePattern = ({ id }: { id: string }) => (
   </pattern>
 )
 
-export const ProfitAndLossChartPatternDefs = () => (
+export const ProfitAndLossChartPatternDefs = ({ idPrefix }: { idPrefix?: string }) => (
   <defs>
-    <StripePattern id={STRIPE_PATTERN_ID} />
-    <StripePattern id={STRIPE_PATTERN_DARK_ID} />
+    <StripePattern id={getStripePatternId(idPrefix)} variant='light' />
+    <StripePattern id={getStripePatternDarkId(idPrefix)} variant='dark' />
   </defs>
 )
diff --git a/src/components/ProfitAndLossHeader/ProfitAndLossHeader.tsx b/src/components/ProfitAndLossHeader/ProfitAndLossHeader.tsx
index 6cddaf18..f9572af7 100644
--- a/src/components/ProfitAndLossHeader/ProfitAndLossHeader.tsx
+++ b/src/components/ProfitAndLossHeader/ProfitAndLossHeader.tsx
@@ -68,7 +68,11 @@ export const ProfitAndLossHeader = ({
         )}
       </span>
       <HStack gap='xs'>
-        {rightContent}
+        {rightContent && (
+          <div className='Layer__profit-and-loss-header__right-content'>
+            {rightContent}
+          </div>
+        )}
         {withDatePicker && <CombinedDateRangeSelection mode={dateSelectionMode} showLabels={false} />}
         {withDownloadButton && <ProfitAndLossDownloadButton stringOverrides={stringOverrides?.downloadButton} />}
       </HStack>
diff --git a/src/components/ProfitAndLossHeader/profitAndLossHeader.scss b/src/components/ProfitAndLossHeader/profitAndLossHeader.scss
index 8e2dda88..03faacb8 100644
--- a/src/components/ProfitAndLossHeader/profitAndLossHeader.scss
+++ b/src/components/ProfitAndLossHeader/profitAndLossHeader.scss
@@ -9,6 +9,11 @@
   gap: var(--spacing-2xs);
 }
 
+.Layer__profit-and-loss-header__right-content {
+  flex: 1 1 auto;
+  min-width: 0;
+}
+
 @container (width < 460px) {
   .Layer__profit-and-loss-header__bookkeeping-status {
     position: static;
diff --git a/src/contexts/ProfitAndLossContext/ProfitAndLossContext.tsx b/src/contexts/ProfitAndLossContext/ProfitAndLossContext.tsx
index a46edb6c..a9574808 100644
--- a/src/contexts/ProfitAndLossContext/ProfitAndLossContext.tsx
+++ b/src/contexts/ProfitAndLossContext/ProfitAndLossContext.tsx
@@ -27,10 +27,8 @@ export const ProfitAndLossContext = createContext<ReturnType<typeof useProfitAnd
   tagFilter: undefined,
   selectedLineItem: null,
   setSelectedLineItem: () => {},
-  setDateSelectionMode: ({ dateMode }) => ({
-    startDate: startOfMonth(new Date()),
-    endDate: endOfMonth(new Date()),
-    dateMode,
-  }),
+  setDateSelectionMode: () => {
+    throw new Error('ProfitAndLossContext is uninitialized')
+  },
   dateSelectionMode: 'month',
 })
diff --git a/src/providers/GlobalDateStore/GlobalDateStoreProvider.tsx b/src/providers/GlobalDateStore/GlobalDateStoreProvider.tsx
index 8ad8a74b..6fbd117d 100644
--- a/src/providers/GlobalDateStore/GlobalDateStoreProvider.tsx
+++ b/src/providers/GlobalDateStore/GlobalDateStoreProvider.tsx
@@ -60,7 +60,9 @@ export type GlobalDateState = DateRange & { dateMode: DateSelectionMode }
 
 type GlobalDateActions = {
   setDate: (options: { date: Date }) => DateRange
+  setExactDate: (options: { date: Date }) => DateRange
   setDateRange: (options: { startDate: Date, endDate: Date }) => DateRange
+  setExactDateRange: (options: { startDate: Date, endDate: Date }) => DateRange
   setMonth: (options: { startDate: Date }) => DateRange
   setYear: (options: { startDate: Date }) => DateRange
   setDateMode: (options: { dateMode: DateSelectionMode }) => GlobalDateState
@@ -107,6 +109,12 @@ function buildStore() {
       return apply({ startDate: s, endDate: e })
     }
 
+    const setExactDate = ({ date }: { date: Date }): DateRange => {
+      const s = RANGE_MODE_LOOKUP.full.getStartDate({ startDate: date })
+      const e = RANGE_MODE_LOOKUP.full.getEndDate({ endDate: date })
+      return apply({ startDate: s, endDate: e })
+    }
+
     const setDateRange = withCorrectedRange(({ startDate, endDate }): DateRange => {
       const { dateMode } = get()
       const s = RANGE_MODE_LOOKUP[dateMode].getStartDate({ startDate })
@@ -114,6 +122,12 @@ function buildStore() {
       return apply({ startDate: s, endDate: e })
     })
 
+    const setExactDateRange = withCorrectedRange(({ startDate, endDate }): DateRange => {
+      const s = RANGE_MODE_LOOKUP.full.getStartDate({ startDate })
+      const e = RANGE_MODE_LOOKUP.full.getEndDate({ endDate })
+      return apply({ startDate: s, endDate: e })
+    })
+
     const setMonth = ({ startDate }: { startDate: Date }): DateRange => {
       const s = RANGE_MODE_LOOKUP.month.getStartDate({ startDate })
       const e = RANGE_MODE_LOOKUP.month.getEndDate({ endDate: startDate })
@@ -140,7 +154,9 @@ function buildStore() {
 
       actions: {
         setDate,
+        setExactDate,
         setDateRange,
+        setExactDateRange,
         setMonth,
         setYear,
         setDateMode,
@@ -172,8 +188,9 @@ export function useGlobalDateActions() {
   const store = useContext(GlobalDateStoreContext)
 
   const setDate = useStore(store, ({ actions: { setDate } }) => setDate)
+  const setExactDate = useStore(store, ({ actions: { setExactDate } }) => setExactDate)
 
-  return { setDate }
+  return { setDate, setExactDate }
 }
 
 export function useGlobalDateRange({ dateSelectionMode }: { dateSelectionMode: DateSelectionMode }) {
@@ -194,12 +211,14 @@ export function useGlobalDateRangeActions() {
   const store = useContext(GlobalDateStoreContext)
 
   const setDateRange = useStore(store, ({ actions: { setDateRange } }) => setDateRange)
+  const setExactDateRange = useStore(store, ({ actions: { setExactDateRange } }) => setExactDateRange)
   const setMonth = useStore(store, ({ actions: { setMonth } }) => setMonth)
   const setYear = useStore(store, ({ actions: { setYear } }) => setYear)
   const setDateMode = useStore(store, ({ actions: { setDateMode } }) => setDateMode)
 
   return {
     setDateRange,
+    setExactDateRange,
     setMonth,
     setYear,
     setDateMode,
diff --git a/src/styles/profit_and_loss.scss b/src/styles/profit_and_loss.scss
index 9d29a834..a36123b0 100644
--- a/src/styles/profit_and_loss.scss
+++ b/src/styles/profit_and_loss.scss
@@ -306,18 +306,22 @@
   stroke: var(--color-base-200);
 }
 
+.Layer__stripe-pattern--light rect,
 #layer-bar-stripe-pattern rect {
   fill: var(--color-light);
 }
 
+.Layer__stripe-pattern--light line,
 #layer-bar-stripe-pattern line {
   stroke: var(--color-light);
 }
 
+.Layer__stripe-pattern--dark rect,
 #layer-bar-stripe-pattern-dark rect {
   fill: var(--color-dark);
 }
 
+.Layer__stripe-pattern--dark line,
 #layer-bar-stripe-pattern-dark line {
   stroke: var(--color-dark);
 }
diff --git a/src/views/AccountingOverview/AccountingOverview.tsx b/src/views/AccountingOverview/AccountingOverview.tsx
index a8b5c87d..9345ea4f 100644
--- a/src/views/AccountingOverview/AccountingOverview.tsx
+++ b/src/views/AccountingOverview/AccountingOverview.tsx
@@ -146,7 +146,7 @@ export const AccountingOverview = ({
           asWidget
         >
           <ProfitAndLoss.Header
-            text='Profit & Loss'
+            text='Revenue & Expenses Breakdown'
             rightContent={<PnLHorizontalBarChartLegend />}
           />
           <PnLHorizontalBarChart />
diff --git a/src/views/ProjectProfitability/ProjectProfitability.tsx b/src/views/ProjectProfitability/ProjectProfitability.tsx
index 58b40813..ec137884 100644
--- a/src/views/ProjectProfitability/ProjectProfitability.tsx
+++ b/src/views/ProjectProfitability/ProjectProfitability.tsx
@@ -1,4 +1,4 @@
-import { useEffect, useState } from 'react'
+import { useState } from 'react'
 import Select, { type Options } from 'react-select'
 
 import { DisplayState } from '@internal-types/bank_transactions'
@@ -7,7 +7,6 @@ import { type PnlTagFilter } from '@hooks/useProfitAndLoss/useProfitAndLoss'
 import {
   type DateSelectionMode,
   useGlobalDateMode,
-  useGlobalDateModeActions,
 } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
 import { Toggle } from '@ui/Toggle/Toggle'
 import { BankTransactions } from '@components/BankTransactions/BankTransactions'
@@ -52,15 +51,10 @@ export const ProjectProfitabilityView = ({
   const [activeTab, setActiveTab] = useState<ProjectTab>('overview')
   const [tagFilter, setTagFilter] = useState<TagOption | null>(null)
   const globalDateSelectionMode = useGlobalDateMode()
-  const { setDateMode } = useGlobalDateModeActions()
   const [pnlTagFilter, setPnlTagFilter] = useState<PnlTagFilter | undefined>(
     undefined,
   )
 
-  useEffect(() => {
-    setDateMode({ dateMode: dateSelectionMode })
-  }, [dateSelectionMode, setDateMode])
-
   const isOptionSelected = (
     option: TagOption,
     selectValue: Options<TagOption>,

```

## Untracked implementation files (full content, machine-captured)

## Addendum — March 3, 2026 (Dead-code cleanup: 3 orphaned artifacts removed)
- Purpose: Remove 3 dead-code artifacts left over from the earlier iteration where the Month/Custom toggle was placed on Reports pages. That was reverted, leaving these orphans.
- Files deleted in this follow-up:
  - `src/components/DateSelection/GlobalDateControls.tsx` — untracked wrapper component with zero consumers after Reports revert.
  - `src/components/DateSelection/globalDateControls.scss` — companion stylesheet for the deleted component.
- Files reverted to HEAD in this follow-up:
  - `src/components/DateSelection/CombinedDateSelection.tsx` — the `truncateMonth` prop added here had no consumer. The sibling `CombinedDateRangeSelection.tsx` retains its `truncateMonth` prop (used by `AccountingOverview.tsx`).
- Code removed from existing files in this follow-up:
  - `src/providers/GlobalDateStore/GlobalDateStoreProvider.tsx`:
    - Removed `setExactDate` action implementation from `buildStore()`.
    - Removed `setExactDateRange` action implementation from `buildStore()`.
    - Removed both from the `actions` object returned by the store.
    - Removed both from the `GlobalDateActions` type.
    - Removed `setExactDate` from `useGlobalDateActions()` hook (reverted to returning only `{ setDate }`).
    - Removed `setExactDateRange` from `useGlobalDateRangeActions()` hook.
- Documentation updates:
  - `REVIEW_FILE_JUSTIFICATIONS.md` — marked `GlobalDateControls.tsx`, `globalDateControls.scss`, and `CombinedDateSelection.tsx` entries as REMOVED/REVERTED; amended `GlobalDateStoreProvider.tsx` entry to reflect removal of dead setters.
- Validation done in this follow-up:
  - `grep -r "GlobalDateControls" src/` — zero results confirmed.
  - `grep -r "setExactDate\|setExactDateRange" src/` — zero results confirmed.
  - `npm run typecheck` passed.
  - Linter check passed via `ReadLints` on `GlobalDateStoreProvider.tsx`.
