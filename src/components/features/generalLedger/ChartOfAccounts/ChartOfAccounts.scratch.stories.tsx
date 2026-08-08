import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { ChartOfAccounts } from '@features/generalLedger/ChartOfAccounts/ChartOfAccounts'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { handlers } from '@msw/handlers'
import { findEntryRows } from '@testUtils/storybook/interactions/findEntryRows'

const meta: Meta<typeof ChartOfAccounts> = {
  title: 'Scratch/ChartOfAccountsReversal',
  component: ChartOfAccounts,
  parameters: { chromatic: { viewports: [1280] } },
  render: () => <ChartOfAccounts withExpandAllButton />,
}

export default meta

type Story = StoryObj<typeof ChartOfAccounts>

// Leaving the account panel remounts the table collapsed, and it collapses again as refetched
// balances land, so re-expand until the account's row is on screen.
const findAccountRow = async (canvasElement: HTMLElement, accountName: string) => {
  const canvas = within(canvasElement)

  await findEntryRows(canvas)

  return waitFor(async () => {
    const expandAll = canvas.queryByRole('button', { name: 'Expand All' })
    if (expandAll) await userEvent.click(expandAll)

    const accountRow = canvas.getByRole('button', { name: accountName }).closest('[role="row"]')
    if (!(accountRow instanceof HTMLElement)) throw new Error(`no row for ${accountName}`)
    return accountRow
  }, { timeout: 20_000 })
}

const openFirstEntryForAccount = async (canvasElement: HTMLElement, accountName: string, entryType: string) => {
  const canvas = within(canvasElement)

  await findAccountRow(canvasElement, accountName)
  await userEvent.click(canvas.getByRole('button', { name: accountName }))
  await canvas.findByText('Current balance', undefined, { timeout: 10_000 })

  // The line items table re-renders as revalidation settles, detaching the row that was just found.
  await waitFor(async () => {
    const [, firstEntry] = await findEntryRows(canvas)
    await userEvent.click(firstEntry)
    await canvas.findByText(entryType)
  }, { timeout: 20_000 })

  return canvas
}

export const ScratchManualEntryReversal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await openFirstEntryForAccount(canvasElement, 'Income Tax', 'Manual')

    await canvas.findByRole('button', { name: /Reverse entry/ }, { timeout: 10_000 })
  },
}

export const ScratchManualEntryReversalRefreshesDrawer: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await openFirstEntryForAccount(canvasElement, 'Income Tax', 'Manual')

    const reverseButton = await canvas.findByRole('button', { name: /Reverse entry/ }, { timeout: 10_000 })
    await expect(canvas.queryByText('Reversal')).toBeNull()

    await userEvent.click(reverseButton)

    await canvas.findByText('Reversal', undefined, { timeout: 20_000 })
    await waitFor(async () => {
      await expect(await canvas.findByRole('button', { name: /Reverse entry/ })).toBeDisabled()
    }, { timeout: 20_000 })
  },
}

export const ScratchReversalRefreshesAccountBalance: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const balanceBefore = (await findAccountRow(canvasElement, 'Income Tax')).textContent

    await openFirstEntryForAccount(canvasElement, 'Income Tax', 'Manual')
    await userEvent.click(await canvas.findByRole('button', { name: /Reverse entry/ }, { timeout: 10_000 }))
    await userEvent.click(await canvas.findByRole('button', { name: 'Back' }))

    await waitFor(async () => {
      const accountRow = await findAccountRow(canvasElement, 'Income Tax')
      await expect(accountRow.textContent).not.toEqual(balanceBefore)
    }, { timeout: 20_000 })
  },
}

export const ScratchNonManualEntryNoReversal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await openFirstEntryForAccount(canvasElement, 'Equipment & Machinery', 'Expense')

    await waitFor(async () => {
      await expect(canvas.queryByRole('button', { name: /Reverse entry/ })).toBeNull()
    })
  },
}

export const ScratchManualEntryActiveBookkeepingNoReversal: Story = {
  parameters: {
    msw: {
      handlers: [
        getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })),
        ...handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = await openFirstEntryForAccount(canvasElement, 'Income Tax', 'Manual')

    await waitFor(async () => {
      await expect(canvas.queryByRole('button', { name: /Reverse entry/ })).toBeNull()
    })
  },
}
