import { type Meta } from '@storybook/react-vite'

// The linked-accounts props shared by every component that embeds the linked
// accounts list (LinkedAccounts, BankTransactionsWithLinkedAccounts).
export type LinkedAccountsStoryArgs = {
  showLedgerBalance: boolean
}

export const linkedAccountsStoryDefaultArgs: LinkedAccountsStoryArgs = {
  showLedgerBalance: true,
}

type LinkedAccountsArgTypes = NonNullable<Meta<LinkedAccountsStoryArgs>['argTypes']>

export const makeLinkedAccountsStoryControls = ({ category }: { category?: string } = {}) => {
  const argTypes: LinkedAccountsArgTypes = {
    showLedgerBalance: {
      control: 'boolean',
      description: 'Show each account’s ledger balance row',
      table: { category },
    },
  }

  const controlNames = Object.keys(argTypes)

  return { argTypes, controlNames }
}
