import { type Meta, type StoryObj } from '@storybook/react-vite'

import { LinkedAccounts, type LinkedAccountsProps } from '@components/LinkedAccounts/LinkedAccounts'

import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'

type LinkedAccountsStoryArgs = {
  showLedgerBalance: boolean
  title: string
} & Pick<LinkedAccountsProps, 'stringOverrides'>

/*
 * Trim the seeded store to two accounts instead of overriding the GET handler:
 * the add-account (plaid link exchange) and confirm/exclude mocks mutate the
 * store, so the GET must stay store-driven for those flows to work.
 */
const keepTwoAccounts = () => {
  bankAccounts.slice(2).forEach(({ id }) => bankAccountStore.deleteById(id))
}

const meta: Meta<LinkedAccountsStoryArgs> = {
  title: 'Components/LinkedAccounts',
  component: LinkedAccounts,
  loaders: [keepTwoAccounts],
  parameters: {
    controls: { include: ['showLedgerBalance', 'stringOverrides.title'] },
  },
  args: {
    showLedgerBalance: false,
    title: '',
  },
  argTypes: {
    stringOverrides: { table: { disable: true } },
    showLedgerBalance: {
      control: 'boolean',
      description: 'Show each account’s ledger balance row',
    },
    title: {
      name: 'stringOverrides.title',
      control: 'text',
      description:
        'The real prop is `stringOverrides?: { title?: string }`. Type a value to set '
        + '`stringOverrides.title`, or leave it blank to omit the override and use the default.',
      table: {
        category: 'String overrides',
        type: { summary: '{ title?: string }' },
        defaultValue: { summary: 'Linked Accounts' },
      },
    },
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
  render: ({ showLedgerBalance, title }) => (
    <LinkedAccounts
      showLedgerBalance={showLedgerBalance}
      stringOverrides={title ? { title } : undefined}
    />
  ),
}

export default meta

type Story = StoryObj<LinkedAccountsStoryArgs>

export const Default: Story = {}
