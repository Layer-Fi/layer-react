import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ChartOfAccounts, type ChartOfAccountsProps } from '@components/ChartOfAccounts/ChartOfAccounts'

type ChartOfAccountsStoryArgs = {
  showAddAccountButton: boolean
  templateAccountsEditable: boolean
  withDateControl: boolean
  withExpandAllButton: boolean
  headerText: string
} & Pick<ChartOfAccountsProps, 'stringOverrides'>

const meta: Meta<ChartOfAccountsStoryArgs> = {
  title: 'Components/ChartOfAccounts',
  component: ChartOfAccounts,
  parameters: {
    controls: {
      include: [
        'showAddAccountButton',
        'templateAccountsEditable',
        'withDateControl',
        'withExpandAllButton',
        'stringOverrides.chartOfAccountsTable.headerText',
      ],
    },
  },
  args: {
    showAddAccountButton: true,
    templateAccountsEditable: true,
    withDateControl: false,
    withExpandAllButton: true,
    headerText: '',
  },
  argTypes: {
    stringOverrides: { table: { disable: true } },
    showAddAccountButton: {
      control: 'boolean',
      description: 'Show the add account button',
    },
    templateAccountsEditable: {
      control: 'boolean',
      description: 'Allow editing accounts from the base template',
    },
    withDateControl: {
      control: 'boolean',
      description: 'Show the date picker',
    },
    withExpandAllButton: {
      control: 'boolean',
      description: 'Show the expand-all button',
    },
    headerText: {
      name: 'stringOverrides.chartOfAccountsTable.headerText',
      control: 'text',
      description:
        'The real prop is `stringOverrides?: { chartOfAccountsTable?: { headerText?: string } }`. Type a '
        + 'value to override the table header, or leave it blank to omit the override and use the default.',
      table: {
        category: 'String overrides',
        type: { summary: '{ chartOfAccountsTable?: { headerText?: string } }' },
        defaultValue: { summary: 'Chart of Accounts' },
      },
    },
  },
  render: ({ showAddAccountButton, templateAccountsEditable, withDateControl, withExpandAllButton, headerText }) => (
    <ChartOfAccounts
      showAddAccountButton={showAddAccountButton}
      templateAccountsEditable={templateAccountsEditable}
      withDateControl={withDateControl}
      withExpandAllButton={withExpandAllButton}
      stringOverrides={headerText ? { chartOfAccountsTable: { headerText } } : undefined}
    />
  ),
}

export default meta

type Story = StoryObj<ChartOfAccountsStoryArgs>

export const Default: Story = {}
