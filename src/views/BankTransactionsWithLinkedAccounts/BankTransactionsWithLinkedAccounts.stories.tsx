import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, within } from 'storybook/test'

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

function makeUserPresentRequiredAccount(
  options: Parameters<typeof makeBankAccountWithMirroredExternalAccount>[0],
) {
  return makeBankAccountWithMirroredExternalAccount({
    ...options,
    externalAccountOverrides: {
      ...options.externalAccountOverrides,
      updateType: 'USER_PRESENT_REQUIRED',
    },
  })
}

const multipleAccountsOnConnection = [
  makeUserPresentRequiredAccount({
    id: '00000001-1500-442c-8d79-cb0f139d1301',
    externalAccountId: '469aa9b2-1500-509f-8c7d-061a6fa33d01',
    name: 'Chase Checking',
    institution: 'Chase',
    mask: '4048',
    balance: 2_500_000,
    externalAccountOverrides: {
      connectionExternalId: 'plaid_chase_1',
    },
  }),
  makeBankAccountWithMirroredExternalAccount({
    id: '00000001-1501-442c-8d79-cb0f139d1301',
    externalAccountId: '469aa9b2-1501-509f-8c7d-061a6fa33d01',
    name: 'Chase Savings',
    institution: 'Chase',
    mask: '7890',
    balance: 1_500_000,
    externalAccountOverrides: {
      connectionExternalId: 'plaid_chase_1',
    },
  }),
]

const multipleInstitutionConnections = [
  ...multipleAccountsOnConnection,
  makeUserPresentRequiredAccount({
    id: '00000001-1502-442c-8d79-cb0f139d1301',
    externalAccountId: '469aa9b2-1502-509f-8c7d-061a6fa33d01',
    name: 'RBC Checking',
    institution: 'RBC',
    mask: '1122',
    balance: 1_000_000,
    externalAccountOverrides: {
      connectionExternalId: 'plaid_rbc_1',
    },
  }),
  makeUserPresentRequiredAccount({
    id: '00000001-1503-442c-8d79-cb0f139d1301',
    externalAccountId: '469aa9b2-1503-509f-8c7d-061a6fa33d01',
    name: 'RBC Savings',
    institution: 'RBC',
    mask: '3344',
    balance: 500_000,
    externalAccountOverrides: {
      connectionExternalId: 'plaid_rbc_1',
    },
  }),
]

const multipleChaseConnections = [
  ...multipleAccountsOnConnection,
  makeUserPresentRequiredAccount({
    id: '00000001-1504-442c-8d79-cb0f139d1301',
    externalAccountId: '469aa9b2-1504-509f-8c7d-061a6fa33d01',
    name: 'Chase Business Card',
    institution: 'Chase',
    mask: '6677',
    balance: 350_000,
    externalAccountOverrides: {
      connectionExternalId: 'plaid_chase_2',
    },
  }),
]

const recentlySyncedNeedsReconnectAccounts = [
  makeUserPresentRequiredAccount({
    id: '00000001-1506-442c-8d79-cb0f139d1301',
    externalAccountId: '469aa9b2-1506-509f-8c7d-061a6fa33d01',
    name: 'RBC Checking',
    institution: 'RBC',
    mask: '4048',
    balance: 2_500_000,
    externalAccountOverrides: {
      connectionExternalId: 'plaid_rbc_4048',
      lastSyncedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
    },
  }),
]

const backgroundUpdateBankAccounts = [
  makeBankAccountWithMirroredExternalAccount({
    id: '00000001-1505-442c-8d79-cb0f139d1301',
    externalAccountId: '469aa9b2-1505-509f-8c7d-061a6fa33d01',
    name: 'Wealthsimple Checking',
    institution: 'Wealthsimple',
    mask: '9999',
    balance: 900_000,
    externalAccountOverrides: {
      connectionExternalId: 'plaid_wealthsimple_1',
      updateType: 'BACKGROUND',
    },
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

export const MultipleAccountsOnConnection: Story = {
  parameters: {
    msw: {
      handlers: [
        getBankAccounts.mock(multipleAccountsOnConnection),
        ...handlers,
      ],
    },
  },
}

export const MultipleInstitutionConnections: Story = {
  parameters: {
    msw: {
      handlers: [
        getBankAccounts.mock(multipleInstitutionConnections),
        ...handlers,
      ],
    },
  },
}

export const MobileMultipleInstitutionConnections: Story = {
  args: {
    mobileComponent: 'mobileList',
  },
  parameters: {
    chromatic: {
      viewports: [375],
    },
    msw: {
      handlers: [
        getBankAccounts.mock(multipleInstitutionConnections),
        ...handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Refresh 2 bank connections to see recent transactions' }, { timeout: 5000 }))
    await screen.findByRole('menuitem', { name: /Refresh Chase/ }, { timeout: 5000 })
  },
}

export const MultipleChaseConnections: Story = {
  parameters: {
    msw: {
      handlers: [
        getBankAccounts.mock(multipleChaseConnections),
        ...handlers,
      ],
    },
  },
}

export const BackgroundUpdate: Story = {
  parameters: {
    msw: {
      handlers: [
        getBankAccounts.mock(backgroundUpdateBankAccounts),
        ...handlers,
      ],
    },
  },
}

export const RecentlySyncedConnectionNotYetStale: Story = {
  parameters: {
    msw: {
      handlers: [
        getBankAccounts.mock(recentlySyncedNeedsReconnectAccounts),
        ...handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.queryByRole('region', { name: 'Bank connections require attention' }),
    ).not.toBeInTheDocument()
    await expect(canvas.queryByRole('button', { name: /Refresh Now/ })).not.toBeInTheDocument()
    await expect((await canvas.findAllByText('$25,000.00', {}, { timeout: 5000 })).length).toBeGreaterThan(0)
  },
}
