import { useEffect } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { useBankAccountsGlobalCacheActions } from '@api/businesses/[business-id]/bank-accounts/get'
import { LinkedAccounts, type LinkedAccountsProps } from '@features/linkedAccounts/LinkedAccounts/LinkedAccounts'

import { markAccountNeedingConfirmation } from '@fixtures/bankAccounts/mocks'
import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { handlers } from '@msw/handlers'
import {
  type LinkedAccountsStoryArgs as SharedLinkedAccountsArgs,
  linkedAccountsStoryDefaultArgs,
  makeLinkedAccountsStoryControls,
} from '@testUtils/storybook/controls/linkedAccounts'
import {
  DISCONNECTED_ACCOUNTS_SCENARIOS,
  type DisconnectedAccountsScenario,
  getDisconnectedBankAccounts,
} from '@testUtils/storybook/data/bankAccounts'

type LinkedAccountsStoryArgs = SharedLinkedAccountsArgs & {
  title: string
  disconnectedScenario: DisconnectedAccountsScenario
} & Pick<LinkedAccountsProps, 'stringOverrides'>

// MSW handlers register once per story load and can't read args, so the scenario
// control rewrites this array in place and refetches.
const disconnectedAccountsMock = getDisconnectedBankAccounts('One account')

const SyncDisconnectedAccountsMock = ({ scenario }: { scenario: DisconnectedAccountsScenario }) => {
  const { invalidate } = useBankAccountsGlobalCacheActions()

  useEffect(() => {
    disconnectedAccountsMock.splice(0, disconnectedAccountsMock.length, ...getDisconnectedBankAccounts(scenario))
    void invalidate()
  }, [scenario, invalidate])

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
      options: DISCONNECTED_ACCOUNTS_SCENARIOS,
      description: 'Which mocked accounts have a broken Plaid connection',
      table: { category: 'Story data' },
    },
  },
  parameters: {
    controls: { include: [...linkedAccountsControls.controlNames, 'stringOverrides.title', 'Disconnected accounts'] },
    msw: { handlers: [getBankAccounts.mock(disconnectedAccountsMock), ...handlers] },
  },
  render: ({ disconnectedScenario, showLedgerBalance, showRepairAsRefresh, title }) => (
    <>
      <SyncDisconnectedAccountsMock scenario={disconnectedScenario} />
      <LinkedAccounts
        showLedgerBalance={showLedgerBalance}
        showRepairAsRefresh={showRepairAsRefresh}
        stringOverrides={title ? { title } : undefined}
      />
    </>
  ),
}
