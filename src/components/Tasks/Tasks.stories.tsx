import { useEffect, useRef } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BookkeepingStatus } from '@schemas/bookkeepingStatus'
import { useBankAccountsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { Tasks } from '@components/Tasks/Tasks'

import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { handlers } from '@msw/handlers'
import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { FIXTURE_YEAR_RANGE } from '@fixtures/constants/fixtureYear'
import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'
import { PinnedGlobalDateRange } from '@test-utils/PinnedGlobalDateRange'

type TasksStoryArgs = {
  mobile: boolean
  header: string
  showReconnectAction: boolean
  onClickReconnectAccounts?: () => void
}

// MSW handlers register once per story load and can't read args, so the callback
// toggle mutates this array and refetches to control the disconnected banner.
const mockAccounts = [...bankAccounts]

const setSecondAccountDisconnected = (disconnected: boolean) => {
  mockAccounts[1] = disconnected
    ? { ...bankAccounts[1], isDisconnected: true, notifyWhenDisconnected: true }
    : bankAccounts[1]
}

const SyncDisconnectedAccountMock = ({ disconnected }: { disconnected: boolean }) => {
  const { invalidate } = useBankAccountsGlobalCacheActions()
  const isFirstRender = useRef(true)

  useEffect(() => {
    setSecondAccountDisconnected(disconnected)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    void invalidate()
  }, [disconnected, invalidate])

  return null
}

const meta: Meta<TasksStoryArgs> = {
  title: 'Components/Tasks',
  component: Tasks,
  parameters: {
    msw: {
      // Tasks come from bookkeeping periods, which only fetch for enrolled businesses.
      handlers: [
        getBankAccounts.mock(mockAccounts),
        getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })),
        ...handlers,
      ],
    },
    controls: { include: ['mobile', 'stringOverrides.header', 'onClickReconnectAccounts'] },
  },
  args: {
    mobile: false,
    header: '',
    showReconnectAction: false,
  },
  argTypes: {
    onClickReconnectAccounts: { table: { disable: true } },
    mobile: {
      control: 'boolean',
      description:
        'Forces the compact mobile layout for the task list only. Independent of the responsive '
        + 'behavior: the year tabs and month selector adapt to the actual viewport width, not this prop.',
    },
    header: {
      name: 'stringOverrides.header',
      control: 'text',
      description:
        'The real prop is `stringOverrides?: { header?: string }`. Type a value to set '
        + '`stringOverrides.header`, or leave it blank to omit the override and use the default.',
      table: {
        category: 'String overrides',
        type: { summary: '{ header?: string }' },
      },
    },
    showReconnectAction: {
      name: 'onClickReconnectAccounts',
      control: 'boolean',
      description:
        'The real prop is the `onClickReconnectAccounts: () => void` callback. Toggle this on to '
        + 'provide it (an alert here) and to mark a mocked bank account as disconnected so the '
        + 'notification banner renders; toggle off to omit both.',
      table: {
        category: 'Callbacks',
        type: { summary: '() => void' },
      },
    },
  },
  decorators: [
    Story => (
      <PinnedGlobalDateRange dateRange={FIXTURE_YEAR_RANGE}>
        <div style={{ display: 'grid', paddingBlock: '2rem', paddingInline: '3rem' }}>
          <div style={{ display: 'grid', minInlineSize: '20rem', maxInlineSize: '48rem' }}>
            <Story />
          </div>
        </div>
      </PinnedGlobalDateRange>
    ),
  ],
  render: ({ mobile, header, showReconnectAction }) => (
    <>
      <SyncDisconnectedAccountMock disconnected={showReconnectAction} />
      <Tasks
        mobile={mobile}
        stringOverrides={header ? { header } : undefined}
        onClickReconnectAccounts={showReconnectAction ? () => window.alert('Reconnect accounts clicked') : undefined}
      />
    </>
  ),
}

export default meta

type Story = StoryObj<TasksStoryArgs>

export const Default: Story = {}
