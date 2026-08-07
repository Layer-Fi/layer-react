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

const openFirstEntryForAccount = async (canvasElement: HTMLElement, accountName: string, entryType: string) => {
  const canvas = within(canvasElement)

  await findEntryRows(canvas)
  await userEvent.click(await canvas.findByRole('button', { name: 'Expand All' }))
  await userEvent.click(await canvas.findByRole('button', { name: accountName }, { timeout: 10_000 }))
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
