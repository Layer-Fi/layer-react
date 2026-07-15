import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BookkeepingStatus } from '@schemas/bookkeepingStatus'
import { type MobileComponentType } from '@components/BankTransactions/constants'
import { BankTransactionsWithLinkedAccounts } from '@views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts'

import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { handlers } from '@msw/handlers'
import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'

type BankTransactionsWithLinkedAccountsStoryArgs = {
  showTitle: boolean
  elevatedLinkedAccounts: boolean
  showBreakConnection: boolean
  showCategorizationRules: boolean
  showCustomerVendor: boolean
  showDescriptions: boolean
  showLedgerBalance: boolean
  showReceiptUploads: boolean
  showTags: boolean
  showTooltips: boolean
  showUnlinkItem: boolean
  showUploadOptions: boolean
  mobileComponent: MobileComponentType
  title: string
}

const meta: Meta<BankTransactionsWithLinkedAccountsStoryArgs> = {
  title: 'Views/BankTransactionsWithLinkedAccounts',
  component: BankTransactionsWithLinkedAccounts,
  parameters: {
    controls: {
      include: [
        'showTitle',
        'elevatedLinkedAccounts',
        'showBreakConnection',
        'showCategorizationRules',
        'showCustomerVendor',
        'showDescriptions',
        'showLedgerBalance',
        'showReceiptUploads',
        'showTags',
        'showTooltips',
        'showUnlinkItem',
        'showUploadOptions',
        'mobileComponent',
        'stringOverrides.title',
      ],
    },
  },
  args: {
    showTitle: true,
    elevatedLinkedAccounts: false,
    showBreakConnection: false,
    showCategorizationRules: false,
    showCustomerVendor: false,
    showDescriptions: true,
    showLedgerBalance: true,
    showReceiptUploads: true,
    showTags: false,
    showTooltips: false,
    showUnlinkItem: false,
    showUploadOptions: false,
    mobileComponent: 'regularList',
    title: '',
  },
  argTypes: {
    // Deprecated props (`title`, `mode`) and function props are intentionally not knobs.
    showTitle: { control: 'boolean', description: 'Show the view title' },
    elevatedLinkedAccounts: { control: 'boolean', description: 'Render linked accounts with elevation' },
    showBreakConnection: { control: 'boolean', table: { category: 'Linked accounts' } },
    showLedgerBalance: { control: 'boolean', table: { category: 'Linked accounts' } },
    showUnlinkItem: { control: 'boolean', table: { category: 'Linked accounts' } },
    showCategorizationRules: { control: 'boolean', table: { category: 'Bank transactions' } },
    showCustomerVendor: { control: 'boolean', table: { category: 'Bank transactions' } },
    showDescriptions: { control: 'boolean', table: { category: 'Bank transactions' } },
    showReceiptUploads: { control: 'boolean', table: { category: 'Bank transactions' } },
    showTags: { control: 'boolean', table: { category: 'Bank transactions' } },
    showTooltips: { control: 'boolean', table: { category: 'Bank transactions' } },
    showUploadOptions: { control: 'boolean', table: { category: 'Bank transactions' } },
    mobileComponent: {
      control: 'radio',
      options: ['regularList', 'mobileList'],
      description: 'List variant used at narrow container widths',
    },
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
