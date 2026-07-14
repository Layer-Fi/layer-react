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
  // Mirrors how a host app mounts LinkedAccounts: a padded page with a max-width column.
  // The component renders its own Container, so no card border is added here.
  decorators: [
    Story => (
      <div
        className='LinkedAccountsPage'
        style={{ display: 'grid', paddingBlock: '2rem', paddingInline: '3rem' }}
      >
        <div className='LinkedAccountsContainer' style={{ display: 'grid', maxInlineSize: '80rem' }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof LinkedAccounts>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
