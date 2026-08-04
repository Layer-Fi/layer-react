import { waitFor } from 'storybook/test'

type RowQueries = { findAllByRole: (role: 'row') => Promise<HTMLElement[]> }

/**
 * Waits for a table to render rows beyond its header and returns all of them, so index 1 is
 * the first entry. `findAllByRole` alone resolves on the header, before the mocked data lands
 * and re-renders the body — clicking a row queried that early hits a detached node.
 */
export function findEntryRows(canvas: RowQueries): Promise<HTMLElement[]> {
  return waitFor(async () => {
    const rows = await canvas.findAllByRole('row')
    if (rows.length < 2) throw new Error('table has rendered no entries yet')
    return rows
  }, { timeout: 15_000 })
}
