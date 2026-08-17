import { waitFor } from 'storybook/test'

type RowQueries = { findAllByRole: (role: 'row') => Promise<HTMLElement[]> }

const PLACEHOLDER_CELL_SELECTOR = '.Layer__DataTableSkeleton__Cell, .Layer__DataTable__EmptyState__Cell'

const isEntryRow = (row: HTMLElement) => !row.querySelector(PLACEHOLDER_CELL_SELECTOR)

/**
 * Waits for a table to render real entry rows and returns the header plus those rows, so index 1
 * is the first entry. Both the loading skeleton and the empty state render `role="row"` nodes, so
 * a plain row count resolves before the mocked data lands and clicking hits a detached node.
 */
export function findEntryRows(
  canvas: RowQueries,
): Promise<[HTMLElement, HTMLElement, ...HTMLElement[]]> {
  return waitFor(async () => {
    const [header, firstEntry, ...rest] = (await canvas.findAllByRole('row')).filter(isEntryRow)
    if (!header || !firstEntry) throw new Error('table has rendered no entries yet')
    return [header, firstEntry, ...rest]
  }, { timeout: 15_000 })
}
