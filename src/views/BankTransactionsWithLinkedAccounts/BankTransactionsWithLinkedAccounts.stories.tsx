import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { BankTransactionsWithLinkedAccounts } from '@views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts'

import {
  makeBankAccountWithMirroredExternalAccount,
  markAccountReadyForRefresh,
} from '@fixtures/bankAccounts/mocks'
import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { handlers } from '@msw/handlers'
import {
  type BankTransactionsStoryArgs as SharedBankTransactionsArgs,
  bankTransactionsStoryDefaultArgs,
  makeBankTransactionsStoryControls,
} from '@testUtils/storybook/controls/bankTransactions'
import {
  type LinkedAccountsStoryArgs as SharedLinkedAccountsArgs,
  linkedAccountsStoryDefaultArgs,
  makeLinkedAccountsStoryControls,
} from '@testUtils/storybook/controls/linkedAccounts'

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

const reconnectionWorkflowBankAccounts = [
  markAccountReadyForRefresh(makeBankAccountWithMirroredExternalAccount({
    id: '00000001-b730-442c-8d79-cb0f139d1301',
    externalAccountId: '469aa9b2-35e4-509f-8c7d-061a6fa33d01',
    name: 'RBC Checking',
    institution: 'RBC',
    mask: '4048',
    balance: 2_500_000,
    externalAccountOverrides: {
      connectionExternalId: 'plaid_rbc_4048',
    },
  })),
  makeBankAccountWithMirroredExternalAccount({
    id: '00000001-9a55-48cb-8f2a-738709fe0dd2',
    externalAccountId: '00000007-0009-1000-8000-001b8d4052eb',
    name: 'Wealthsimple',
    institution: 'Wealthsimple',
    mask: '7890',
    balance: 1_500_000,
  }),
]

// ACTIVE (a bookkeeping client) disables self-serve categorization.
export const BookkeepingEnabled: Story = {
  tags: ['public-api'],
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
export const BookkeepingDisabled: Story = {
  tags: ['public-api', 'docs-screenshot', 'real-backend'],
  parameters: {
    msw: {
      handlers: [
        getBankAccounts.mock(reconnectionWorkflowBankAccounts),
        ...handlers,
      ],
    },
  },
}
