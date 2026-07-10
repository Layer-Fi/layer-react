import { useCallback, useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { useBankAccountsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { LinkAccounts } from '@components/LinkAccounts/LinkAccounts'

import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'

// The store's default seed is already-linked accounts; this flow links new ones.
const clearBankAccounts = () => {
  bankAccountStore.all().forEach(({ id }) => bankAccountStore.deleteById(id))
}

// Completing the wizard empties the store and remounts the component (via key),
// so the flow restarts from the "Connect my bank" step and can be run repeatedly.
// The SWR cache is overwritten too: the remount's revalidation is deduped away
// (the confirm step refetched moments earlier), so the cleared store alone would
// leave the just-confirmed accounts on screen.
function RestartingLinkAccounts() {
  const [iteration, setIteration] = useState(0)
  const { overwriteCache } = useBankAccountsGlobalCacheActions()

  const handleComplete = useCallback(() => {
    clearBankAccounts()
    void overwriteCache([], { withRevalidate: false })
    setIteration(previous => previous + 1)
  }, [overwriteCache])

  return <LinkAccounts key={iteration} onComplete={handleComplete} />
}

const meta = {
  title: 'Components/LinkAccounts',
  component: LinkAccounts,
  render: () => <RestartingLinkAccounts />,
  argTypes: {
    onComplete: { table: { disable: true } },
    plaidHostedLinkConfig: { table: { disable: true } },
  },
  // Mirrors how a host app mounts LinkAccounts: a padded page with a max-width card.
  decorators: [
    Story => (
      <div
        className='LinkAccountsPage'
        style={{ display: 'grid', paddingBlockStart: '2rem', paddingBlockEnd: '4rem', paddingInline: '3rem' }}
      >
        <div
          className='LinkAccountsContainer'
          style={{
            display: 'grid',
            minInlineSize: '40rem',
            maxInlineSize: '80rem',
            padding: '1rem',
            borderRadius: '1rem',
            border: '1px solid rgb(0 0 0 / 10%)',
          }}
        >
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof LinkAccounts>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Full flow: "Connect my bank" runs the fake Plaid link (SDK mocked via
 * `.storybook/mocks/react-plaid-link.ts`), then the found accounts move into
 * the confirm/exclude step. Completing the wizard restarts the flow.
 */
export const Default: Story = {
  loaders: [clearBankAccounts],
}
