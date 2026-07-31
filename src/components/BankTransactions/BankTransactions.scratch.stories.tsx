import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BankTransactions } from '@components/BankTransactions/BankTransactions'

const meta: Meta<typeof BankTransactions> = {
  title: 'Scratch/BankTransactionsRowPlusMenu',
  component: BankTransactions,
  parameters: {
    controls: { disable: true },
  },
  decorators: [
    Story => (
      <div
        className='BankTransactionsPage'
        style={{ display: 'grid', paddingBlock: '2rem', paddingInline: '3rem' }}
      >
        <div
          className='BankTransactionsContainer'
          style={{ display: 'grid', minInlineSize: '20rem', maxInlineSize: '80rem' }}
        >
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof BankTransactions>

export const CategorizationRulesEnabled: Story = {
  args: {
    showCategorizationRules: true,
  },
}

export const CategorizationRulesDisabled: Story = {
  args: {
    showCategorizationRules: false,
  },
}
