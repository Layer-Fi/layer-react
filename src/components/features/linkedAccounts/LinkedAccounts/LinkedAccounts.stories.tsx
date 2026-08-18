import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'

import { type BankAccount } from '@schemas/features/bankAccounts/bankAccount'
import { LinkedAccounts, type LinkedAccountsProps } from '@features/linkedAccounts/LinkedAccounts/LinkedAccounts'

import { markAccountNeedingConfirmation } from '@fixtures/bankAccounts/mocks'
import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { handlers } from '@msw/handlers'
import {
  type LinkedAccountsStoryArgs as SharedLinkedAccountsArgs,
  makeLinkedAccountsStoryControls,
} from '@testUtils/storybook/controls/linkedAccounts'

type LinkedAccountsStoryArgs = SharedLinkedAccountsArgs & {
  title: string
} & Pick<LinkedAccountsProps, 'stringOverrides'>

// Trim the store rather than overriding the GET handler: the add-account and
// confirm/exclude mocks mutate the store, so the GET must stay store-driven.
const keepTwoAccounts = () => {
  bankAccounts.slice(2).forEach(({ id }) => bankAccountStore.deleteById(id))
}

// Fixed so the disconnected story stays visually stable across snapshots.
const DISCONNECTED_AS_OF = new Date('2024-03-14T12:00:00.000Z')

/*
 * A broken connection is backend state, not a prop: the "Fix account" pill
 * appears when an external account has `connectionNeedsRepairAsOf` set, and the
 * repair action is a no-op without a connection id to repair.
 *
 * `reconnectWithNewCredentials: false` keeps the pill on the update-mode repair
 * path, which is the one whose mock clears the repair flag.
 */
const withBrokenPlaidConnection = (account: BankAccount): BankAccount => ({
  ...account,
  isDisconnected: true,
  externalAccounts: account.externalAccounts.map(externalAccount =>
    externalAccount.externalAccountSource === 'PLAID'
      ? {
        ...externalAccount,
        connectionNeedsRepairAsOf: DISCONNECTED_AS_OF,
        reconnectWithNewCredentials: false,
        connectionExternalId: externalAccount.connectionExternalId ?? 'plaid_item_story_disconnected',
      }
      : externalAccount,
  ),
})

const disconnectedBankAccounts = bankAccounts
  .slice(0, 2)
  .map((account, index) => index === 0 ? withBrokenPlaidConnection(account) : account)

// Seeds the store rather than overriding the GET, so the repair mutation and the
// refetch that follows it read back the account this loader broke.
const breakFirstAccountConnection = () => {
  const [firstAccount] = bankAccountStore.all()
  if (firstAccount) bankAccountStore.save(withBrokenPlaidConnection(firstAccount))
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
  render: ({ showLedgerBalance, title }) => (
    <LinkedAccounts
      showLedgerBalance={showLedgerBalance}
      stringOverrides={title ? { title } : undefined}
    />
  ),
}

export default meta

type Story = StoryObj<LinkedAccountsStoryArgs>

export const Default: Story = {
  tags: ['public-api', 'docs-screenshot', 'real-backend'],
}

// Runs after the meta loader, so it flags the two accounts that survived the trim.
export const ConfirmingAccounts: Story = {
  tags: ['public-api', 'real-backend'],
  loaders: [
    () => bankAccountStore.all().forEach(
      account => bankAccountStore.save(markAccountNeedingConfirmation(account)),
    ),
  ],
}

export const DisconnectedAccount: Story = {
  tags: ['public-api'],
  parameters: {
    msw: { handlers: [getBankAccounts.mock(disconnectedBankAccounts), ...handlers] },
  },
}

// The mocked Plaid Link resolves 800ms after it opens, then the connection-status
// mock clears the repair flag and the accounts refetch, so the snapshot has to wait
// for the healthy state.
export const DisconnectedAccountRepaired: Story = {
  tags: ['public-api'],
  parameters: { chromatic: { delay: 2_000 } },
  loaders: [breakFirstAccountConnection],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Fix account' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Repair connection' }))

    await waitFor(
      () => expect(canvas.queryByRole('button', { name: 'Fix account' })).not.toBeInTheDocument(),
      { timeout: 10_000 },
    )
  },
}
