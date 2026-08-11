/**
 * Backwards-compatible class names for platforms that styled us at or before `0.1.122`.
 *
 * Between `0.1.122` and `0.1.144` the bank transactions view moved off its hand-rolled
 * `<table class="Layer__table">` and onto the shared `DataTable` / `ui/Table` primitives. The
 * rendered markup is different in three separable ways, and only the first is repairable:
 *
 *  1. **Renames.** The same element is still there, under a new class. Re-emitting the old class
 *     alongside the new one makes a customer's existing selector match again, at zero visual cost:
 *     we are adding a hook, not a rule. Everything in {@link BANK_TRANSACTIONS_LEGACY_CLASS_NAMES}
 *     is of this kind.
 *  2. **Removed elements.** `Layer__table-cell-content` was a `<span>` inside every `<td>`; the
 *     cell is now its own flex container and the wrapper is gone. No class can be attached to an
 *     element that is not rendered.
 *  3. **Removed content.** The receipts column is gone entirely, so is the category badge in the
 *     collapsed row. Nothing to hook.
 *
 * Cases 2 and 3 are recorded in {@link BANK_TRANSACTIONS_STRUCTURAL_CHANGES} rather than silently
 * omitted, because a customer chasing a "missing" class needs to be told it is missing on purpose.
 *
 * The declarations that go with these classes live in `legacy-styling.css`, pulled in by
 * `src/styles/index.scss` — production source may not import a stylesheet by path.
 *
 * Scope is deliberately one component. Shared primitives were renamed in the same window
 * (`Layer__btn` → `Layer__UI__Button`, `Layer__chevron` → `Layer__Chevron`, and others listed in
 * {@link OUT_OF_SCOPE_SHARED_RENAMES}); re-emitting those would change every component at once and
 * needs its own decision.
 */

export const LEGACY_STYLING_BASELINE_VERSION = '0.1.122'

/**
 * Column ids of the bank transactions table, mirrored here so the legacy map is keyed by the same
 * strings `getColumnConfig` uses. `Selection` is the id the shared selection column is given.
 */
export const BankTransactionsLegacyColumn = {
  Selection: 'Selection',
  Date: 'Date',
  Transaction: 'Transaction',
  Account: 'Account',
  Amount: 'Amount',
  Category: 'Category',
} as const

export type BankTransactionsLegacyColumn =
  (typeof BankTransactionsLegacyColumn)[keyof typeof BankTransactionsLegacyColumn]

type LegacyColumnClassNames = {
  /** Emitted on the `<th>` — `Layer__UI__Table-Column__BankTransactionsTable--*`. */
  readonly column: readonly string[]
  /** Emitted on the `<td>` — `Layer__UI__Table-Cell__BankTransactionsTable--*`. */
  readonly cell: readonly string[]
}

/**
 * The generic table classes each cell carried in `0.1.122`, and the only ones re-emitted.
 *
 * These name a cell's *role* — a header, a body cell, the amount column's alignment — which is what
 * platform stylesheets reach for when they want a colour or a font. Restoring them costs nothing
 * because nothing about them implies a size.
 *
 * The per-column classes are a different matter; see {@link GEOMETRY_CLASS_NAMES}.
 */
const LEGACY_COLUMN_CLASS_NAMES: Readonly<Record<BankTransactionsLegacyColumn, LegacyColumnClassNames>> = {
  [BankTransactionsLegacyColumn.Selection]: {
    column: ['Layer__table-header'],
    cell: ['Layer__table-cell'],
  },
  [BankTransactionsLegacyColumn.Date]: {
    column: ['Layer__table-header'],
    cell: ['Layer__table-cell'],
  },
  [BankTransactionsLegacyColumn.Transaction]: {
    column: ['Layer__table-header'],
    cell: ['Layer__table-cell'],
  },
  [BankTransactionsLegacyColumn.Account]: {
    column: ['Layer__table-header'],
    cell: ['Layer__table-cell'],
  },
  [BankTransactionsLegacyColumn.Amount]: {
    column: ['Layer__table-header', 'Layer__table-cell--amount'],
    cell: ['Layer__table-cell', 'Layer__table-cell--amount'],
  },
  [BankTransactionsLegacyColumn.Category]: {
    column: ['Layer__table-header', 'Layer__table-header--primary'],
    cell: ['Layer__table-cell', 'Layer__bank-transaction-row__actions-cell'],
  },
}

/**
 * Per-column classes that are deliberately NOT re-emitted, and why.
 *
 * In `0.1.122` these existed to carry geometry: `Layer__bank-transactions__account-col` set a width,
 * `Layer__table-cell__amount-col` set `position: sticky` and a hand-computed `right`. Platform
 * stylesheets used them the same way, to widen a column or to opt out of the sticky behaviour.
 *
 * `0.1.144` sizes the table with `table-layout` and pins columns from JavaScript —
 * `useColumnPinningStyles` writes `position` and `right` as inline styles. Re-emitting these names
 * hands a platform's width rules a `<th>` that no longer decides the column's width, so the header
 * cell paints at the width the rule asks for while the column stays as wide as its content: measured
 * against a real profile, a 288px column with a 180px header, and a 108px hole in the header row.
 *
 * There is no cascade trick that avoids this. The platform's stylesheet loads after ours and would
 * win any reset we wrote, and the failure is not that their rule loses — it is that their rule now
 * applies to an element where it means something different. So the honest fix is to leave these
 * classes off, which puts a platform exactly where `0.1.144` already puts it: the geometry rules do
 * nothing, rather than doing damage.
 *
 * Restoring them for a given platform means first deleting that platform's column geometry, so it is
 * a migration conversation and not a default.
 */
export const GEOMETRY_CLASS_NAMES: Readonly<Record<BankTransactionsLegacyColumn, readonly string[]>> = {
  [BankTransactionsLegacyColumn.Selection]: ['Layer__bank-transactions__checkbox-col'],
  [BankTransactionsLegacyColumn.Date]: [
    'Layer__bank-transactions__date-col',
    'Layer__bank-transaction-table__date-col',
  ],
  [BankTransactionsLegacyColumn.Transaction]: ['Layer__bank-transactions__tx-col'],
  [BankTransactionsLegacyColumn.Account]: ['Layer__bank-transactions__account-col'],
  [BankTransactionsLegacyColumn.Amount]: [
    'Layer__table-cell__amount-col',
    'Layer__bank-transactions__amount-col',
  ],
  [BankTransactionsLegacyColumn.Category]: ['Layer__table-cell__category-col'],
}

/**
 * Legacy classes for everything in the bank transactions view that is not a table column.
 *
 * `root` is a function because `Layer__bank-transactions--to-review` / `--categorized` tracked the
 * display state, which is the one legacy class here that is not constant.
 */
export const BANK_TRANSACTIONS_LEGACY_CLASS_NAMES = {
  /**
   * `<div class="Layer__bank-transactions">` — the display-state modifier it used to carry.
   * `all` had no modifier in `0.1.122` either, so it still gets none.
   */
  root: (display: 'all' | 'review' | 'categorized') => {
    switch (display) {
      case 'review':
        return 'Layer__bank-transactions--to-review'
      case 'categorized':
        return 'Layer__bank-transactions--categorized'
      case 'all':
        return undefined
    }
  },

  /** `<table>` — the generic table class, now `Layer__UI__Table-Table`. */
  table: ['Layer__table'],

  /** The `<td>` holding an expanded row, now `Layer__DataTable__ExpandedRowCell`. */
  expandedRowCell: ['Layer__bank-transaction-row__expanded-td'],

  /** The flex row inside the category cell, now an unnamed `Layer__Stack`. */
  categoryCellContainer: ['Layer__bank-transaction-row__category-hstack'],

  /**
   * The confirm/update button. In `0.1.122` this class sat on the `<button>` itself; in `0.1.144`
   * the nearest named element is the wrapping `<span class="Layer__BankTransactionsSubmitButton">`,
   * so a descendant selector still works but `button.Layer__bank-transaction__submit-btn` does not.
   */
  submitButton: ['Layer__bank-transaction__submit-btn'],

  column: (id: string) => LEGACY_COLUMN_CLASS_NAMES[id as BankTransactionsLegacyColumn]?.column,
  cell: (id: string) => LEGACY_COLUMN_CLASS_NAMES[id as BankTransactionsLegacyColumn]?.cell,
} as const

/**
 * A change the `0.1.144` markup makes that no class name can undo, so that the audit and the
 * upgrade notes can name it instead of leaving the customer to discover it.
 */
export type StructuralChange = {
  /** What the customer's stylesheet is most likely to say. */
  readonly legacySelector: string
  readonly change: string
  /** What to select instead, or `null` when there is no equivalent. */
  readonly replacement: string | null
}

export const BANK_TRANSACTIONS_STRUCTURAL_CHANGES: readonly StructuralChange[] = [
  {
    legacySelector: '.Layer__table-cell-content',
    change: 'The <span> wrapper inside every cell was removed; the cell is now the flex container.',
    replacement: '.Layer__UI__Table-Cell__BankTransactionsTable--<Column>',
  },
  {
    legacySelector: '.Layer__bank-transactions__documents-col',
    change: 'The receipts column was removed; the table renders six columns where it rendered seven.',
    replacement: null,
  },
  {
    legacySelector: '.Layer__bank-transaction-row__actions-cell--open, .Layer__bank-transaction-row__actions-cell--close',
    change: 'The category cell no longer carries an open/closed modifier.',
    replacement: '.Layer__BankTransactionRow--Expanded .Layer__UI__Table-Cell__BankTransactionsTable--Category',
  },
  {
    legacySelector: '.Layer__bank-transaction-row__table-cell--amount-credit, .Layer__bank-transaction-row__table-cell--amount-debit',
    change: 'The amount cell no longer carries a credit/debit modifier.',
    replacement: null,
  },
  {
    legacySelector: '.Layer__bank-transactions__title',
    change: 'The header title is a shared <h3 class="Layer__UI__Heading">; it was an <h2 class="Layer__heading">.',
    replacement: '.Layer__bank-transactions__header .Layer__UI__Heading',
  },
  {
    legacySelector: '.Layer__bank-transaction-row__expand-button',
    change:
      'The row toggle is a shared `Layer__UI__Button`. The class is not re-emitted: the tablet list '
      + 'view still renders it and still styles it (2.25rem square), so re-emitting would resize the '
      + 'table\'s toggle.',
    replacement: '.Layer__UI__Table-Cell__BankTransactionsTable--Category .Layer__UI__Button[data-icon]',
  },
  {
    legacySelector: '.Layer__badge',
    change: 'The category badge is no longer rendered inside a collapsed row.',
    replacement: null,
  },
  {
    legacySelector: '.Layer__btn-content, .Layer__btn-text, .Layer__btn-icon',
    change: 'Buttons no longer wrap their label and icon in nested spans.',
    replacement: '.Layer__UI__Button, .Layer__ButtonIconBox',
  },
]

/**
 * Shared-primitive renames that also landed in this window. Out of scope here — they are listed so
 * the bank transactions audit does not read as if these were the only breaks.
 */
export const OUT_OF_SCOPE_SHARED_RENAMES: Readonly<Record<string, string>> = {
  Layer__InputGroup: 'Layer__UI__InputGroup',
  Layer__MinimalSearchField: 'Layer__SearchField__Field',
  Layer__UI__tooltip_trigger: 'Layer__UI__TooltipTrigger',
  Layer__chevron: 'Layer__Chevron',
  Layer__chevron__down: 'Layer__Chevron--Down',
  Layer__heading: 'Layer__UI__Heading',
  Layer__btn: 'Layer__UI__Button',
  Layer__icon_btn: 'Layer__UI__Button[data-icon]',
  Layer__MoneySpan: 'Layer__Span',
}

/**
 * Every class this module can emit. Built from the map rather than written out again so the two
 * cannot drift, which is what makes {@link isLegacyClassName} trustworthy.
 */
const LEGACY_CLASS_NAMES: ReadonlySet<string> = new Set([
  ...Object.values(LEGACY_COLUMN_CLASS_NAMES).flatMap(({ column, cell }) => [...column, ...cell]),
  ...Object.values(GEOMETRY_CLASS_NAMES).flat(),
  ...BANK_TRANSACTIONS_LEGACY_CLASS_NAMES.table,
  ...BANK_TRANSACTIONS_LEGACY_CLASS_NAMES.expandedRowCell,
  ...BANK_TRANSACTIONS_LEGACY_CLASS_NAMES.categoryCellContainer,
  ...BANK_TRANSACTIONS_LEGACY_CLASS_NAMES.submitButton,
  'Layer__bank-transactions--to-review',
  'Layer__bank-transactions--categorized',
  // Already dual-emitted by `BankTransactionsTable` before this module existed.
  'Layer__bank-transaction-row',
  'Layer__bank-transaction-row--expanded',
  'Layer__bank-transaction-row--removing',
])

/**
 * Whether a class is only present for backwards compatibility. Use this to answer "is this
 * customer selector still supported, or is it just being kept alive?" — a legacy class is a hook we
 * promise to keep rendering, not a name we style against or that new code should reference.
 */
export function isLegacyClassName(className: string) {
  return LEGACY_CLASS_NAMES.has(className)
}

/** The complement of {@link isLegacyClassName}: a class the current markup owns. */
export function isActiveClassName(className: string) {
  return className.startsWith('Layer__') && !LEGACY_CLASS_NAMES.has(className)
}

/**
 * Split a rendered `class` attribute into the names the current markup owns and the names kept for
 * compatibility. The audit uses this to report a customer selector as "matched, but only via a
 * legacy alias" rather than as a clean pass.
 */
export function partitionClassNames(className: string) {
  const active: string[] = []
  const legacy: string[] = []

  for (const name of className.split(/\s+/).filter(Boolean)) {
    if (isLegacyClassName(name)) legacy.push(name)
    else active.push(name)
  }

  return { active, legacy }
}
