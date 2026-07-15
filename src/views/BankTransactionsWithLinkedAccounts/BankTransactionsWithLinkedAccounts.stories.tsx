import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BookkeepingStatus } from '@schemas/bookkeepingStatus'
import { BankTransactionsWithLinkedAccounts } from '@views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts'

import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { handlers } from '@msw/handlers'
import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import {
  type BankTransactionsStoryArgs as SharedBankTransactionsArgs,
  bankTransactionsStoryDefaultArgs,
  makeBankTransactionsStoryControls,
} from '@test-utils/bankTransactionsStoryControls'
import {
  type LinkedAccountsStoryArgs as SharedLinkedAccountsArgs,
  linkedAccountsStoryDefaultArgs,
  makeLinkedAccountsStoryControls,
} from '@test-utils/linkedAccountsStoryControls'

type BankTransactionsWithLinkedAccountsStoryArgs =
  SharedBankTransactionsArgs & SharedLinkedAccountsArgs & {
    showTitle: boolean
    title: string
  }

const bankTransactionsControls = makeBankTransactionsStoryControls({ category: 'Bank transactions' })
const linkedAccountsControls = makeLinkedAccountsStoryControls({ category: 'Linked accounts' })

const meta: Meta<BankTransactionsWithLinkedAccountsStoryArgs> = {
  title: 'Views/BankTransactions/WithLinkedAccounts',
  component: BankTransactionsWithLinkedAccounts,
  parameters: {
    controls: {
      include: [
        'showTitle',
        ...linkedAccountsControls.controlNames,
        ...bankTransactionsControls.controlNames,
        'stringOverrides.title',
      ],
    },
  },
  args: {
    showTitle: true,
    ...linkedAccountsStoryDefaultArgs,
    ...bankTransactionsStoryDefaultArgs,
    title: '',
  },
  argTypes: {
    // Deprecated props (`title`, `mode`) and function props are intentionally not knobs.
    showTitle: { control: 'boolean', description: 'Show the view title' },
    ...linkedAccountsControls.argTypes,
    ...bankTransactionsControls.argTypes,
    title: {
      name: 'stringOverrides.title',
      control: 'text',
      description: 'Leave blank to omit the override and use the default.',
      table: { category: 'String overrides' },
    },
  },
  decorators: [
    Story => (
      <div
        className='BankTransactionsWithLinkedAccountsPage'
        style={{ display: 'grid', paddingBlock: '2rem', paddingInline: '3rem' }}
      >
        <div
          className='BankTransactionsWithLinkedAccountsContainer'
          style={{ display: 'grid', minInlineSize: '20rem', maxInlineSize: '80rem' }}
        >
          <Story />
        </div>
      </div>
    ),
  ],
  render: ({ title, ...args }) => (
    <BankTransactionsWithLinkedAccounts
      {...args}
      stringOverrides={title ? { title } : undefined}
    />
  ),
}

export default meta

type Story = StoryObj<BankTransactionsWithLinkedAccountsStoryArgs>

// ACTIVE (a bookkeeping client) disables self-serve categorization.
export const BookkeepingEnabled: Story = {
  parameters: {
    msw: {
      handlers: [
        getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })),
        ...handlers,
      ],
    },
  },
}

// The global mock's status is NOT_PURCHASED, so categorization is enabled.
export const BookkeepingDisabled: Story = {}
