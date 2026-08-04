import { useCallback, useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { useBankAccountsGlobalCacheActions } from '@api/businesses/[business-id]/bank-accounts/get'
import { LinkAccounts } from '@features/linkedAccounts/LinkAccounts/LinkAccounts'

import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { markAccountNeedingConfirmation } from '@fixtures/bankAccounts/mocks'

const clearBankAccounts = () => {
  bankAccountStore.all().forEach(({ id }) => bankAccountStore.deleteById(id))
}

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
  tags: ['public-api'],
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
        style={{ display: 'grid', paddingBlock: '2rem', paddingInline: '3rem' }}
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

export const Default: Story = {
  tags: ['docs-screenshot'],
  loaders: [clearBankAccounts],
}

// The two states after the Plaid handoff. Both start from the seeded store rather than
// the cleared one, since the link step renders a card per connected account.
export const AccountsLinked: Story = {
  // Docs captures this at desktop only, and the interaction is desktop-shaped:
  // the header collapses to icon buttons below the tablet breakpoint.
  parameters: { chromatic: { viewports: [1280] } },
  tags: ['docs-screenshot'],
}

export const ConfirmingBusinessAccounts: Story = {
  // Docs captures this at desktop only, and the interaction is desktop-shaped:
  // the header collapses to icon buttons below the tablet breakpoint.
  parameters: { chromatic: { viewports: [1280] } },
  tags: ['docs-screenshot'],
  loaders: [
    () => bankAccountStore.all().forEach(
      account => bankAccountStore.save(markAccountNeedingConfirmation(account)),
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: /done linking/ }))
  },
}
