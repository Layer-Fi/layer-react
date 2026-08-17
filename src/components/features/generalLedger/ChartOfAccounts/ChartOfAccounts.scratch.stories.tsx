import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { ChartOfAccounts } from '@features/generalLedger/ChartOfAccounts/ChartOfAccounts'

import { findEntryRows } from '@testUtils/storybook/interactions/findEntryRows'

const meta: Meta<typeof ChartOfAccounts> = {
  title: 'Scratch/ChartOfAccountsReversal',
  component: ChartOfAccounts,
  parameters: { chromatic: { viewports: [1280] } },
  render: () => <ChartOfAccounts withExpandAllButton />,
}

export default meta

type Story = StoryObj<typeof ChartOfAccounts>

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

  await waitFor(async () => {
    const [, firstEntry] = await findEntryRows(canvas)
    await userEvent.click(firstEntry)
    await canvas.findByText(entryType)
  }, { timeout: 20_000 })

  return canvas
}

export const ScratchReversalRefreshesPanelHeaderBalance: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await openFirstEntryForAccount(canvasElement, 'Income Tax', 'Manual')

    const balanceBefore = (await canvas.findByText('Current balance')).parentElement?.textContent

    await userEvent.click(await canvas.findByRole('button', { name: /Reverse entry/ }, { timeout: 10_000 }))
    await canvas.findByText('Reversal', undefined, { timeout: 20_000 })

    await waitFor(async () => {
      const balanceAfter = (await canvas.findByText('Current balance')).parentElement?.textContent
      await expect(balanceAfter).not.toEqual(balanceBefore)
    }, { timeout: 20_000 })
  },
}
