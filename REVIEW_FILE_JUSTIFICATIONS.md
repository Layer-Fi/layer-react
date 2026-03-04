# File-by-File Justifications for CTO Code Review

This document provides a rigorous, file-by-file breakdown of every modified and new file in the current working tree. Its purpose is to give you explicit architectural, performance, and UX justifications to defend these choices during CTO and Staff Engineering reviews.

## 1. Global Date State & Control Unification

### `src/providers/GlobalDateStore/GlobalDateStoreProvider.tsx`
- **What Changed:** Moved `dateMode` ('month' vs 'full/custom') into global state. Standard setters (`setDate`, `setDateRange`) read `dateMode` during assignments.
- **Why We Did It:** Eliminates fragmented date states across the app. Previously, users changing the date mode in one view (e.g., Reports) would lose that context in another (e.g., Overview). Centralizing this prevents state desync.
- **Dead code removed:** `setExactDate`, `setExactDateRange` actions, their type declarations, and their hook exports were removed — no consumer ever called them after the Reports revert.

### `src/components/DateSelection/GlobalDateModeToggle.tsx` (New)
- **What Changed:** Created a reusable standalone toggle for 'Month' vs 'Custom' mode.
- **Why We Did It:** Component encapsulation. We needed this toggle in multiple disparate headers (Overview vs Reports). Keeping it distinct ensures we don't duplicate state-binding logic for the global store and maintains a single visual source of truth.

### `src/components/DateSelection/GlobalDateControls.tsx` — REMOVED
- **Status:** Deleted. This wrapper component combined the `GlobalDateModeToggle` and the date pickers. After reverting the Month/Custom toggle from Reports pages, no consumers remained. Removed as dead code.

### `src/components/DateSelection/globalDateControls.scss` — REMOVED
- **Status:** Deleted. Companion stylesheet for `GlobalDateControls.tsx`. No consumers after the component was removed.

### `src/components/DateSelection/CombinedDateRangeSelection.tsx`
- **What Changed:** Added a `truncateMonth` prop to conditionally render shorter month labels.
- **Why We Did It:** Saves crucial horizontal real estate in constrained header layouts (specifically smaller viewports). Still actively used by `AccountingOverview.tsx`.

### `src/components/DateSelection/CombinedDateSelection.tsx` — REVERTED
- **Status:** Reverted to HEAD. The `truncateMonth` prop was added here but no consumer ever passes it. The sibling `CombinedDateRangeSelection.tsx` retains its `truncateMonth` prop (used by `AccountingOverview.tsx`).

## 2. Reports Sub-System — Reverted to Original

### `src/views/Reports/Reports.tsx`
### `src/components/ProfitAndLossReport/ProfitAndLossReport.tsx`
### `src/components/BalanceSheet/BalanceSheet.tsx`
### `src/components/StatementOfCashFlow/StatementOfCashFlow.tsx`
### `src/styles/reports.scss`
- **What Changed:** All five files were reverted to their committed (HEAD) state. The Month/Custom toggle, `GlobalDateControls`, and shared report header utility classes have been removed from Reports pages.
- **Why We Reverted:** The Month/Custom toggle should only live on the Accounting Overview page. Reports pages retain their original date pickers and layout. Changing the date range on a Reports page still updates the global date store (via the `setDateSelectionMode` effect in `ProfitAndLossReport`), keeping date state synchronized without exposing the toggle UI.

## 3. Data Fetching & Shared Context Optimizations

### `src/hooks/useProfitAndLoss/schemas.ts`
- **What Changed:** Added `includeTransactionCounts` to API request schemas and introduced `TransactionCountsSchema` to handle snake_case to camelCase mappings.
- **Why We Did It:** Architecture planning for performance. We need transaction bookkeeping stats for the new UI widgets, but making a separate API call per widget is too computationally expensive. We update the schema so the backend can piggyback this payload onto the standard P&L fetch.

### `src/hooks/useProfitAndLoss/useProfitAndLossReport.tsx`
- **What Changed:** Appends `includeTransactionCounts` to the API request and SWR cache key (`buildKey`).
- **Why We Did It:** Critical caching integrity. SWR needs to know that a request *with* counts is fundamentally different from one *without* counts; caching them under the same key would cause aggressive payload collisions and UI desync bugs.

### `src/hooks/useProfitAndLoss/useProfitAndLoss.tsx`
- **What Changed:** Replaced the original local `useState` for `dateSelectionMode` with a hybrid approach: reads the global mode as the default, but `setDateSelectionMode` writes to a local override (`localModeOverride`) instead of the global store. The effective mode is `localModeOverride ?? globalMode`. Also enforces `includeTransactionCounts: true` for downstream P&L SWR fetches.
- **Why We Did It:** Prevents cross-view mode contamination. The Reports page sets its mode to `'full'` on mount, but this must not leak into the global store or the Overview's Monthly mode would be destroyed on navigation. The local override ensures each mounted ProfitAndLoss provider has its own mode scope while still reacting to global mode changes driven by the Overview toggle.

### `src/contexts/ProfitAndLossContext/ProfitAndLossContext.tsx`
- **What Changed:** Modified the default `setDateSelectionMode` implementation from a no-op to throwing a hard error.
- **Why We Did It:** Fails fast. The previous no-op silently returned fabricated Date objects if the context was uninitialized, masking severe component mounting race-conditions. A throw immediately surfaces architectural misplacements during development.

### `src/views/AccountingOverview/internal/TransactionsToReview.tsx`
- **What Changed:** Removed its standalone data fetching hook and `tagFilter` prop. Now reads directly from `ProfitAndLossContext.data.transactionCounts`.
- **Why We Did It:** Massive performance win. We eliminated an entirely redundant network request. By reading the shared context, this widget instantly synchronizes with the rest of the P&L page load.

### `src/hooks/useProfitAndLossComparison/useProfitAndLossComparison.tsx`
- **What Changed:** Changed the comparative range generation to use the context's dynamic `dateSelectionMode` rather than statically assuming 'month'.
- **Why We Did It:** Data accuracy. If a user was looking at a custom date range, the comparison hook was previously still calculating off a hardcoded month, leading to completely nonsensical comparative metrics.

### `src/components/ProfitAndLossSummaries/ProfitAndLossSummaries.tsx`
- **What Changed:** Reverted the `showPercentageChanges` prop. The summaries (Revenue, Expenses, Net Profit, Transactions to Review) are now only rendered in 'month' mode on the Overview, so percentage change suppression is no longer needed.
- **Why We Did It:** Simplification. Since the entire summaries block is hidden in custom mode, conditional percentage logic is dead code. Removing it keeps the component surface area minimal.

## 4. Overview UI & New Visualizations

### `src/views/AccountingOverview/AccountingOverview.tsx`
- **What Changed:** Implemented stacked date controls, updated wrapper classes, and added conditional rendering to toggle between the original P&L Chart ('month' mode) and the new `PnLHorizontalBarChart` ('custom' mode). In custom mode, the Revenue/Expenses/Net Profit/Transactions-to-Review summary banners are now hidden entirely. The `onTransactionsToReviewClick` callback is forwarded to the `PnLHorizontalBarChart` for its CTA. The `showPercentageChanges` prop was removed.
- **Why We Did It:** Brings the Accounting Overview into alignment with the new global capabilities. Hiding the top-level summaries in custom mode avoids redundancy since the horizontal bar chart now displays its own Net Profit header and contextual transaction CTA. Conditionally rendering the charts maintains the original behavior for standard month views while introducing the detailed bookkeeping breakdown for custom date ranges.

### `src/styles/accounting_overview.scss`
- **What Changed:** Added specific layout configurations for the Overview header, including vertical padding, structural normalization classes, and container query collapse breakpoints.
- **Why We Did It:** Layout isolation. The Overview header operates spatially differently than Report headers. These rules ensure the stacked date controls breathe appropriately and stack cleanly without requiring messy inline React styles.

### `src/components/PnLHorizontalBarChart/PnLHorizontalBarChart.tsx` (New)
- **What Changed:** Built a net-new categorized vs uncategorized horizontal stacked bar chart. Reads counts from context and exports a detached legend. Displays a Net Profit amount with label under the header date range. Revenue and Expenses bar rows are rendered inside a single unified container. Accepts an `onTransactionsToReviewClick` prop and renders a "Review transactions" CTA with a chevron at the bottom-right when provided.
- **Why We Did It:** High-value UX addition. This delivers immediate, scannable feedback on bookkeeping health (how much money is categorized vs uncategorized) right on the landing view, utilizing the newly optimized transaction counts data. The embedded Net Profit replaces the hidden top-level summary banner. The CTA provides a direct path to the transactions page without relying on the hidden Transactions-to-Review banner.

### `src/components/PnLHorizontalBarChart/pnLHorizontalBarChart.scss` (New)
- **What Changed:** Added styling for the new horizontal chart: unified bars container with single border/gradient background, separator between Revenue and Expenses rows, Net Profit label styling, CTA button layout, legend text, and container queries for mobile stacking.
- **Why We Did It:** Ensures the new component respects the existing legacy design tokens (using CSS variables instead of hardcoded hex values) and correctly stacks layouts when constrained in narrow dashboard cards. The single-border container visually groups Revenue and Expenses as one cohesive unit.

### `src/components/ProfitAndLossHeader/ProfitAndLossHeader.tsx`
- **What Changed:** Added an optional `rightContent` injection slot into the header layout stack.
- **Why We Did It:** Architecture flexibility. The new chart's legend logically belongs in the header for spatial efficiency, rather than crammed inside the Recharts canvas. This inversion of control allows any parent to place contextual actions/legends right beside the date controls.

### `src/components/ProfitAndLossHeader/profitAndLossHeader.scss`
- **What Changed:** Added flex-shrink constraints (`flex: 1 1 auto; min-width: 0;`) to the new `rightContent` wrapper.
- **Why We Did It:** Layout bug prevention. Prevents injected content (like long legends) from overflowing and breaking the header's flexbox alignment on small screens.

### `src/components/ProfitAndLossChart/ProfitAndLossChartPatternDefs.tsx`
- **What Changed:** Refactored static SVG `<defs>` IDs to use dynamic `idPrefix` injections via prop.
- **Why We Did It:** Fixes a critical shadow DOM collision bug. Because multiple charts might use these SVG stripe patterns, static IDs caused the browser to arbitrarily apply the first definition it found to all subsequent charts, resulting in the wrong fill colors.

### `src/styles/profit_and_loss.scss`
- **What Changed:** Moved chart fill definitions out of inline React styles and back into standard SCSS classes, dropping `!important` tags.
- **Why We Did It:** CSS hygiene and maintainability. Avoids CSS-in-JS style specificity wars and lets standard CSS cascade rules properly govern SVG styling.

### `src/views/ProjectProfitability/ProjectProfitability.tsx`
- **What Changed:** Removed an aggressive `useEffect` that mutated global state on mount, replacing it with synchronized prop handling.
- **Why We Did It:** Side-effect fix. The aggressive mount effect was causing race conditions where navigating *to* this view would destructively overwrite the global date mode for other concurrent views before the user had taken any action.

## 5. Documentation Files

### `CURRENT_STATE_OVERVIEW_PNL.md`
- **What Changed:** Auto-generated system snapshot documenting exact git state, file diffs, and context.
- **Why We Did It:** Strict state preservation. Acts as the undisputed source of truth for the codebase state before committing, ensuring seamless continuity for AI agents or pair programming sessions.

### `CODE_REVIEW_PNL.md`
- **What Changed:** High-level review and risk analysis document.
- **Why We Did It:** Preemptive defensive engineering. Highlights specific edge-cases (like missing global state tests or SWR cache splitting risks) so the engineering team can systematically mitigate architectural risks before a production merge.
