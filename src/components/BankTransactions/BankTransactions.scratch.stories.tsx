import { type StoryObj } from '@storybook/react-vite'
import { screen, userEvent, within } from 'storybook/test'

import bankTransactionsMeta from '@components/BankTransactions/BankTransactions.stories'

const meta = {
  ...bankTransactionsMeta,
  title: 'Scratch/BankTransactions',
}

export default meta

type Story = StoryObj<typeof meta>

// The record transaction menu renders its items only while open.
const openRecordTransactionMenu: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement)
  await userEvent.click(await canvas.findByLabelText('Record transaction'))
}

// The plus menu only renders when upload options are enabled.
export const RecordTransactionMenuOpen: Story = {
  parameters: { chromatic: { viewports: [1280], delay: 500 } },
  args: { showUploadOptions: true, showCategorizationRules: true },
  play: openRecordTransactionMenu,
}

export const RecordTransactionMenuOpenWithoutCategorizationRules: Story = {
  parameters: { chromatic: { viewports: [1280], delay: 500 } },
  args: { showUploadOptions: true, showCategorizationRules: false },
  play: openRecordTransactionMenu,
}

// The create rule form renders in a centered modal on desktop and a drawer on mobile.
export const CreateRuleFormOpen: Story = {
  parameters: { chromatic: { delay: 500 } },
  args: { showUploadOptions: true, showCategorizationRules: true },
  play: async (context) => {
    await openRecordTransactionMenu(context)
    await userEvent.click(await screen.findByText('Create a rule'))
    await screen.findByRole('dialog')
  },
}
