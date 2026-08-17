import { type Meta, type StoryObj } from '@storybook/react-vite'
import { screen, userEvent, within } from 'storybook/test'

import { type BankTransactionsStringOverrides } from '@internal-types/features/bankTransactions/bankTransactionsStringOverrides'
import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { BankTransactions } from '@features/bankTransactions/BankTransactions/BankTransactions'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { makeCategorizationRuleSuggestion } from '@fixtures/categorizationRules/mocks'
import { bankTransactions } from '@fixtures/generated/bankTransactions.gen'
import { put as putCategorizeBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/categorize/put'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { handlers } from '@msw/handlers'
import {
  type BankTransactionsStoryArgs as SharedBankTransactionsArgs,
  bankTransactionsStoryDefaultArgs,
  makeBankTransactionsStoryControls,
} from '@testUtils/storybook/controls/bankTransactions'
import { findEntryRows } from '@testUtils/storybook/interactions/findEntryRows'

type BankTransactionsStoryArgs = SharedBankTransactionsArgs & {
  pageSize: number
  showStatusToggle: boolean
  applyGlobalDateRange: boolean
  monthlyView: boolean
  hideHeader: boolean
  collapseHeader: boolean
  headerText: string
  approveButtonText: string
  updateButtonText: string
  dateColumnHeaderText: string
  transactionColumnHeaderText: string
  accountColumnHeaderText: string
  amountColumnHeaderText: string
  categorizeColumnHeaderText: string
  categoryColumnHeaderText: string
}

const textOverrideArgType = (realProp: string) => ({
  name: realProp,
  control: 'text' as const,
  description: 'Leave blank to omit the override and use the default.',
  table: { category: 'String overrides' },
})

function buildStringOverrides({
  headerText,
  approveButtonText,
  updateButtonText,
  dateColumnHeaderText,
  transactionColumnHeaderText,
  accountColumnHeaderText,
  amountColumnHeaderText,
  categorizeColumnHeaderText,
  categoryColumnHeaderText,
}: BankTransactionsStoryArgs): BankTransactionsStringOverrides | undefined {
  const table = {
    ...(dateColumnHeaderText ? { dateColumnHeaderText } : {}),
    ...(transactionColumnHeaderText ? { transactionColumnHeaderText } : {}),
    ...(accountColumnHeaderText ? { accountColumnHeaderText } : {}),
    ...(amountColumnHeaderText ? { amountColumnHeaderText } : {}),
    ...(categorizeColumnHeaderText ? { categorizeColumnHeaderText } : {}),
    ...(categoryColumnHeaderText ? { categoryColumnHeaderText } : {}),
  }
  const ctas = {
    ...(approveButtonText ? { approveButtonText } : {}),
    ...(updateButtonText ? { updateButtonText } : {}),
  }

  const stringOverrides: BankTransactionsStringOverrides = {
    ...(headerText ? { bankTransactionsHeader: { header: headerText } } : {}),
    ...(Object.keys(table).length ? { transactionsTable: table } : {}),
    ...(Object.keys(ctas).length ? { bankTransactionCTAs: ctas } : {}),
  }

  return Object.keys(stringOverrides).length ? stringOverrides : undefined
}

const bankTransactionsControls = makeBankTransactionsStoryControls()

const meta: Meta<BankTransactionsStoryArgs> = {
  title: 'Components/BankTransactions',
  component: BankTransactions,
  parameters: {
    controls: {
      include: [
        'pageSize',
        ...bankTransactionsControls.controlNames,
        'showStatusToggle',
        'applyGlobalDateRange',
        'monthlyView',
        'hideHeader',
        'collapseHeader',
        'stringOverrides.bankTransactionsHeader.header',
        'stringOverrides.bankTransactionCTAs.approveButtonText',
        'stringOverrides.bankTransactionCTAs.updateButtonText',
        'stringOverrides.transactionsTable.dateColumnHeaderText',
        'stringOverrides.transactionsTable.transactionColumnHeaderText',
        'stringOverrides.transactionsTable.accountColumnHeaderText',
        'stringOverrides.transactionsTable.amountColumnHeaderText',
        'stringOverrides.transactionsTable.categorizeColumnHeaderText',
        'stringOverrides.transactionsTable.categoryColumnHeaderText',
      ],
    },
  },
  args: {
    pageSize: 20,
    ...bankTransactionsStoryDefaultArgs,
    showStatusToggle: true,
    applyGlobalDateRange: false,
    monthlyView: false,
    hideHeader: false,
    collapseHeader: false,
    headerText: '',
    approveButtonText: '',
    updateButtonText: '',
    dateColumnHeaderText: '',
    transactionColumnHeaderText: '',
    accountColumnHeaderText: '',
    amountColumnHeaderText: '',
    categorizeColumnHeaderText: '',
    categoryColumnHeaderText: '',
  },
  argTypes: {
    // Deprecated props (`mode`, `categorizeView`) and function props are intentionally not knobs.
    pageSize: { control: { type: 'number', min: 1 }, description: 'Transactions per page' },
    ...bankTransactionsControls.argTypes,
    showStatusToggle: { control: 'boolean' },
    applyGlobalDateRange: {
      control: 'boolean',
      description: 'Use the global date range as the date filter',
    },
    monthlyView: {
      control: 'boolean',
      description: 'Group transactions by month with infinite scroll',
    },
    hideHeader: { control: 'boolean', description: 'Hide the header entirely' },
    collapseHeader: { control: 'boolean', description: 'Render the compact header layout' },
    headerText: textOverrideArgType('stringOverrides.bankTransactionsHeader.header'),
    approveButtonText: textOverrideArgType('stringOverrides.bankTransactionCTAs.approveButtonText'),
    updateButtonText: textOverrideArgType('stringOverrides.bankTransactionCTAs.updateButtonText'),
    dateColumnHeaderText: textOverrideArgType('stringOverrides.transactionsTable.dateColumnHeaderText'),
    transactionColumnHeaderText: textOverrideArgType('stringOverrides.transactionsTable.transactionColumnHeaderText'),
    accountColumnHeaderText: textOverrideArgType('stringOverrides.transactionsTable.accountColumnHeaderText'),
    amountColumnHeaderText: textOverrideArgType('stringOverrides.transactionsTable.amountColumnHeaderText'),
    categorizeColumnHeaderText: textOverrideArgType('stringOverrides.transactionsTable.categorizeColumnHeaderText'),
    categoryColumnHeaderText: textOverrideArgType('stringOverrides.transactionsTable.categoryColumnHeaderText'),
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
  render: (args) => {
    const {
      pageSize,
      showCategorizationRules,
      showCustomerVendor,
      showStatusToggle,
      showTags,
      showTooltips,
      showUploadOptions,
      applyGlobalDateRange,
      monthlyView,
      mobileComponent,
      hideHeader,
      collapseHeader,
    } = args

    return (
      <BankTransactions
        pageSize={pageSize}
        showCategorizationRules={showCategorizationRules}
        showCustomerVendor={showCustomerVendor}
        showStatusToggle={showStatusToggle}
        showTags={showTags}
        showTooltips={showTooltips}
        showUploadOptions={showUploadOptions}
        applyGlobalDateRange={applyGlobalDateRange}
        monthlyView={monthlyView}
        mobileComponent={mobileComponent}
        hideHeader={hideHeader}
        collapseHeader={collapseHeader}
        stringOverrides={buildStringOverrides(args)}
      />
    )
  },
}

export default meta

type Story = StoryObj<BankTransactionsStoryArgs>

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

const CATEGORIZABLE_DESCRIPTIONS = bankTransactions.flatMap(transaction =>
  (transaction.suggestedMatches ?? []).length === 0 && transaction.description
    ? [transaction.description]
    : [],
)

// The global mock's status is NOT_PURCHASED, so categorization is enabled.
export const BookkeepingDisabled: Story = {
  tags: ['public-api', 'real-backend'],
}

// Same state, with a row expanded to show the categorize form the collapsed rows can't convey.
// Split from `BookkeepingDisabled` so the public-api story stays free of interactions.
export const DocsCategorization: Story = {
  tags: ['docs-screenshot'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rows = await findEntryRows(canvas)
    const row = rows.find(candidate =>
      CATEGORIZABLE_DESCRIPTIONS.some(description => candidate.textContent?.includes(description)),
    )
    if (!row) throw new Error('no categorizable transaction row is on the first page')

    const toggle = within(row).getByRole('button', { name: 'Toggle details' })
    await userEvent.click(toggle)
    await canvas.findByLabelText('Categorize or match transaction')
  },
}

// The rule suggestion rides back on the categorize response, so confirming any row raises it.
const suggestRuleAfterCategorizing = putCategorizeBankTransaction.mock({
  ...bankTransactions[0],
  updateCategorizationRulesSuggestion: makeCategorizationRuleSuggestion(),
})

async function confirmFirstCategorizableRow(canvasElement: HTMLElement): Promise<void> {
  const canvas = within(canvasElement)
  const rows = await findEntryRows(canvas)
  const row = rows.find(candidate =>
    CATEGORIZABLE_DESCRIPTIONS.some(description => candidate.textContent?.includes(description)),
  )
  if (!row) throw new Error('no categorizable transaction row is on the first page')

  await userEvent.click(within(row).getByRole('button', { name: 'Confirm' }))
  // The dialog portals out of the canvas, so query the whole document.
  await screen.findByText('Always use this category?', undefined, { timeout: 10_000 })
}

export const DocsRuleSuggestionPrompt: Story = {
  tags: ['docs-screenshot'],
  parameters: { msw: { handlers: [suggestRuleAfterCategorizing, ...handlers] } },
  play: ({ canvasElement }) => confirmFirstCategorizableRow(canvasElement),
}

export const DocsRuleSuggestionPreview: Story = {
  tags: ['docs-screenshot'],
  parameters: { msw: { handlers: [suggestRuleAfterCategorizing, ...handlers] } },
  play: async ({ canvasElement }) => {
    await confirmFirstCategorizableRow(canvasElement)

    await userEvent.click(await screen.findByRole('button', { name: 'Yes, always categorize' }))
    await screen.findByText(/transactions will be affected/)
  },
}
