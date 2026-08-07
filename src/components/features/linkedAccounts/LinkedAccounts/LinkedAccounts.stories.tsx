import { useEffect } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { useBankAccountsGlobalCacheActions } from '@api/businesses/[business-id]/bank-accounts/get'
import { LinkedAccounts, type LinkedAccountsProps } from '@features/linkedAccounts/LinkedAccounts/LinkedAccounts'

import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'
import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import {
  type LinkedAccountsStoryArgs as SharedLinkedAccountsArgs,
  makeLinkedAccountsStoryControls,
} from '@testUtils/storybook/controls/linkedAccounts'

const PLAID_CONNECTION_STATES = ['connected', 'needsRepair', 'needsReconnect'] as const
type PlaidConnectionState = (typeof PLAID_CONNECTION_STATES)[number]

type LinkedAccountsStoryArgs = SharedLinkedAccountsArgs & {
  title: string
  plaidConnectionState: PlaidConnectionState
} & Pick<LinkedAccountsProps, 'stringOverrides'>

// Trim the store rather than overriding the GET handler: the add-account and
// confirm/exclude mocks mutate the store, so the GET must stay store-driven.
const keepTwoAccounts = () => {
  bankAccounts.slice(2).forEach(({ id }) => bankAccountStore.deleteById(id))
}

// Fixed so the disconnected story stays visually stable across snapshots.
const DISCONNECTED_AS_OF = new Date('2024-03-14T12:00:00.000Z')
const STORY_PLAID_ITEM_ID = 'plaid_item_story_disconnected'

/*
 * A disconnected Plaid account is backend state, not a prop: the "Fix account"
 * pill appears when an external account has `connectionNeedsRepairAsOf` set, and
 * `reconnectWithNewCredentials` decides whether repairing reuses the existing
 * item (update mode) or starts a brand new Plaid link.
 */
const setFirstAccountConnectionState = (state: PlaidConnectionState) => {
  const [firstAccount] = bankAccountStore.all()
  if (!firstAccount) return

  bankAccountStore.patchById(firstAccount.id, account => ({
    ...account,
    isDisconnected: state !== 'connected',
    externalAccounts: account.externalAccounts.map(externalAccount =>
      externalAccount.externalAccountSource === 'PLAID'
        ? {
          ...externalAccount,
          connectionNeedsRepairAsOf: state === 'connected' ? null : DISCONNECTED_AS_OF,
          reconnectWithNewCredentials: state === 'needsReconnect',
          // The repair action is a no-op without an item to repair.
          connectionExternalId: externalAccount.connectionExternalId ?? STORY_PLAID_ITEM_ID,
        }
        : externalAccount,
    ),
  }))
}

/*
 * The loader seeds the store before the first fetch, but the story remounts on
 * arg changes without a store reset - so re-apply the state and refetch to keep
 * the rendered accounts in sync with the control.
 */
const SyncPlaidConnectionState = ({ state }: { state: PlaidConnectionState }) => {
  const { invalidate } = useBankAccountsGlobalCacheActions()

  useEffect(() => {
    setFirstAccountConnectionState(state)
    void invalidate()
  }, [state, invalidate])

  return null
}

const linkedAccountsControls = makeLinkedAccountsStoryControls()

const meta: Meta<LinkedAccountsStoryArgs> = {
  title: 'Components/LinkedAccounts',
  tags: ['public-api'],
  component: LinkedAccounts,
  loaders: [
    keepTwoAccounts,
    ({ args }) => setFirstAccountConnectionState(args.plaidConnectionState),
  ],
  parameters: {
    controls: {
      include: [
        ...linkedAccountsControls.controlNames,
        'stringOverrides.title',
        'plaidConnectionState',
      ],
    },
  },
  args: {
    showLedgerBalance: false,
    title: '',
    plaidConnectionState: 'connected',
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
    plaidConnectionState: {
      control: 'inline-radio',
      options: PLAID_CONNECTION_STATES,
      description:
        'Not a prop - mocked API state for the first account. `needsRepair` and `needsReconnect` '
        + 'both set `connection_needs_repair_as_of` so the account renders the “Fix account” pill; '
        + '`needsReconnect` also sets `reconnect_with_new_credentials`, which makes '
        + '“Repair connection” start a fresh Plaid link instead of Plaid update mode.',
      table: {
        category: 'Mocked API state',
        defaultValue: { summary: 'connected' },
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
  render: ({ showLedgerBalance, title, plaidConnectionState }) => (
    <>
      <SyncPlaidConnectionState state={plaidConnectionState} />
      <LinkedAccounts
        showLedgerBalance={showLedgerBalance}
        stringOverrides={title ? { title } : undefined}
      />
    </>
  ),
}

export default meta

type Story = StoryObj<LinkedAccountsStoryArgs>

export const Default: Story = {
  tags: ['docs-screenshot'],
}

export const DisconnectedAccount: Story = {
  args: { plaidConnectionState: 'needsRepair' },
}
