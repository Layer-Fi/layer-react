import { type Meta, type StoryObj } from '@storybook/react-vite'

import { LinkedAccounts } from '@components/LinkedAccounts/LinkedAccounts'

const meta = {
  title: 'Components/LinkedAccounts',
  component: LinkedAccounts,
  argTypes: {
    asWidget: { table: { disable: true } },
    elevated: { table: { disable: true } },
    plaidHostedLinkConfig: { table: { disable: true } },
  },
  decorators: [
    Story => (
      <div
        className='LinkedAccountsPage'
        style={{ display: 'grid', paddingBlock: '2rem', paddingInline: '3rem' }}
      >
        <div
          className='LinkedAccountsContainer'
          style={{ display: 'grid', minInlineSize: '20rem', maxInlineSize: '80rem' }}
        >
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof LinkedAccounts>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
