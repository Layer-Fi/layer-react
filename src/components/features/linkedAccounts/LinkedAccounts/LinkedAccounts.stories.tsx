import { useLayoutEffect } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type BankAccount } from '@schemas/features/bankAccounts/bankAccount'
import { useBankAccountsGlobalCacheActions } from '@api/businesses/[business-id]/bank-accounts/get'
import { LinkedAccounts, type LinkedAccountsProps } from '@features/linkedAccounts/LinkedAccounts/LinkedAccounts'

import { markAccountNeedingConfirmation } from '@fixtures/bankAccounts/mocks'
import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'
import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import {
  type LinkedAccountsStoryArgs as SharedLinkedAccountsArgs,
  linkedAccountsStoryDefaultArgs,
  makeLinkedAccountsStoryControls,
} from '@testUtils/storybook/controls/linkedAccounts'
import { type DisconnectedAccountScenario, disconnectedAccountScenarios } from '@testUtils/storybook/data/bankAccounts'

type LinkedAccountsStoryArgs = SharedLinkedAccountsArgs & {
  title: string
  disconnectedScenario: DisconnectedAccountScenario
} & Pick<LinkedAccountsProps, 'stringOverrides'>

const SeedBankAccounts = ({ accounts }: { accounts: ReadonlyArray<BankAccount> }) => {
  const { invalidate } = useBankAccountsGlobalCacheActions()

  useLayoutEffect(() => {
    bankAccountStore.all().forEach(({ id }) => bankAccountStore.deleteById(id))
    accounts.forEach(account => bankAccountStore.save(account))
    void invalidate()
  }, [accounts, invalidate])

  return null
}

// Trim the store rather than overriding the GET handler: the add-account and
// confirm/exclude mocks mutate the store, so the GET must stay store-driven.
const keepTwoAccounts = () => {
  bankAccounts.slice(2).forEach(({ id }) => bankAccountStore.deleteById(id))
}

const linkedAccountsControls = makeLinkedAccountsStoryControls()

const meta: Meta<LinkedAccountsStoryArgs> = {
  title: 'Components/LinkedAccounts',
  component: LinkedAccounts,
  loaders: [keepTwoAccounts],
  parameters: {
    controls: { include: [...linkedAccountsControls.controlNames, 'stringOverrides.title'] },
  },
  args: {
    ...linkedAccountsStoryDefaultArgs,
    showLedgerBalance: false,
    title: '',
  },
  argTypes: {
    stringOverrides: { table: { disable: true } },
    ...linkedAccountsControls.argTypes,
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
  render: ({ showLedgerBalance, showRepairAsRefresh, title }) => (
    <LinkedAccounts
      showLedgerBalance={showLedgerBalance}
      showRepairAsRefresh={showRepairAsRefresh}
      stringOverrides={title ? { title } : undefined}
    />
  ),
}

export default meta

type Story = StoryObj<LinkedAccountsStoryArgs>

export const Default: Story = {
  tags: ['public-api', 'docs-screenshot'],
}

// Runs after the meta loader, so it flags the two accounts that survived the trim.
export const ConfirmingAccounts: Story = {
  tags: ['public-api'],
  loaders: [
    () => bankAccountStore.all().forEach(
      account => bankAccountStore.save(markAccountNeedingConfirmation(account)),
    ),
  ],
}

export const DisconnectedAccount: Story = {
  tags: ['public-api'],
  args: { disconnectedScenario: 'One account' },
  argTypes: {
    disconnectedScenario: {
      name: 'Disconnected accounts',
      control: 'radio',
      options: Object.keys(disconnectedAccountScenarios),
      table: { category: 'Story data' },
    },
  },
  parameters: {
    controls: { include: [...linkedAccountsControls.controlNames, 'stringOverrides.title', 'Disconnected accounts'] },
  },
  render: ({ disconnectedScenario, showLedgerBalance, showRepairAsRefresh, title }) => (
    <>
      <SeedBankAccounts accounts={disconnectedAccountScenarios[disconnectedScenario]} />
      <LinkedAccounts
        showLedgerBalance={showLedgerBalance}
        showRepairAsRefresh={showRepairAsRefresh}
        stringOverrides={title ? { title } : undefined}
      />
    </>
  ),
}
