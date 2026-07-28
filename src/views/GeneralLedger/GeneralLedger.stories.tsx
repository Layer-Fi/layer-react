import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type GeneralLedgerProps, GeneralLedgerView } from '@views/GeneralLedger/GeneralLedger'

type GeneralLedgerStoryArgs = {
  showTitle: boolean
  showTags: boolean
  showCustomerVendor: boolean
  title: string
  templateAccountsEditable: boolean
  showAddAccountButton: boolean
  showAddEntryButton: boolean
} & Pick<GeneralLedgerProps, 'stringOverrides' | 'chartOfAccountsOptions' | 'journalOptions'>

const meta: Meta<GeneralLedgerStoryArgs> = {
  title: 'Views/GeneralLedger',
  component: GeneralLedgerView,
  parameters: {
    controls: {
      include: [
        'showTitle',
        'showTags',
        'showCustomerVendor',
        'stringOverrides.title',
        'chartOfAccountsOptions.templateAccountsEditable',
        'chartOfAccountsOptions.showAddAccountButton',
        'journalOptions.showAddEntryButton',
      ],
    },
  },
  args: {
    showTitle: true,
    showTags: true,
    showCustomerVendor: true,
    title: '',
    templateAccountsEditable: true,
    showAddAccountButton: true,
    showAddEntryButton: true,
  },
  argTypes: {
    stringOverrides: { table: { disable: true } },
    chartOfAccountsOptions: { table: { disable: true } },
    journalOptions: { table: { disable: true } },
    showTitle: {
      control: 'boolean',
      description: 'Show the view title and header row',
    },
    showTags: {
      control: 'boolean',
      description: 'Show transaction tags on journal entries',
    },
    showCustomerVendor: {
      control: 'boolean',
      description: 'Show customer/vendor columns on journal entries',
    },
    title: {
      name: 'stringOverrides.title',
      control: 'text',
      description:
        'The real prop is `stringOverrides?: { title?: string, ... }`. Type a value to set '
        + '`stringOverrides.title`, or leave it blank to omit the override and use the default.',
      table: {
        category: 'String overrides',
        type: { summary: '{ title?: string }' },
        defaultValue: { summary: 'General Ledger' },
      },
    },
    templateAccountsEditable: {
      name: 'chartOfAccountsOptions.templateAccountsEditable',
      control: 'boolean',
      description: 'Allow editing accounts from the base template on the Chart of Accounts tab',
      table: { category: 'Chart of accounts options' },
    },
    showAddAccountButton: {
      name: 'chartOfAccountsOptions.showAddAccountButton',
      control: 'boolean',
      description: 'Show the add account button on the Chart of Accounts tab',
      table: { category: 'Chart of accounts options' },
    },
    showAddEntryButton: {
      name: 'journalOptions.showAddEntryButton',
      control: 'boolean',
      description: 'Show the add entry button on the Journal tab',
      table: { category: 'Journal options' },
    },
  },
  render: ({ showTitle, showTags, showCustomerVendor, title, templateAccountsEditable, showAddAccountButton, showAddEntryButton }) => (
    <GeneralLedgerView
      showTitle={showTitle}
      showTags={showTags}
      showCustomerVendor={showCustomerVendor}
      stringOverrides={title ? { title, chartOfAccounts: {}, journal: {} } : undefined}
      chartOfAccountsOptions={{ templateAccountsEditable, showAddAccountButton }}
      journalOptions={{ showAddEntryButton }}
    />
  ),
}

export default meta

type Story = StoryObj<GeneralLedgerStoryArgs>

export const Default: Story = {}
