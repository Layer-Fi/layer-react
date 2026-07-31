import { type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import bankTransactionsMeta from '@components/BankTransactions/BankTransactions.stories'

const meta = {
  ...bankTransactionsMeta,
  title: 'Scratch/BankTransactions',
}

export default meta

type Story = StoryObj<typeof meta>

// The record transaction menu renders its items only while open.
const openRecordTransactionMenu: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement)
  await userEvent.click(await canvas.findByLabelText('Record transaction'))
}

export const RecordTransactionMenuOpen: Story = {
  parameters: { chromatic: { viewports: [1280], delay: 500 } },
  args: { showCategorizationRules: true },
  play: openRecordTransactionMenu,
}

export const RecordTransactionMenuOpenWithoutCategorizationRules: Story = {
  parameters: { chromatic: { viewports: [1280], delay: 500 } },
  args: { showCategorizationRules: false },
  play: openRecordTransactionMenu,
}
