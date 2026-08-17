import { type Meta, type StoryObj } from '@storybook/react-vite'
import { GridList } from 'react-aria-components/GridList'
import { userEvent, within } from 'storybook/test'

import { LinkedAccountGridItem } from '@features/linkedAccounts/LinkedAccountGridItem/LinkedAccountGridItem'

import { makeBankAccount } from '@fixtures/bankAccounts/mocks'

const PLAID_ACCOUNT_MISSING_OPENING_BALANCE = makeBankAccount({
  notifications: [{ type: 'OPENING_BALANCE_MISSING' }],
})

const CUSTOM_ACCOUNT_MISSING_OPENING_BALANCE = makeBankAccount({
  notifications: [{ type: 'OPENING_BALANCE_MISSING' }],
  externalAccounts: PLAID_ACCOUNT_MISSING_OPENING_BALANCE.externalAccounts.map(externalAccount => ({
    ...externalAccount,
    externalAccountSource: 'CUSTOM',
    userCreated: true,
    connectionExternalId: null,
  })),
})

const openAccountOptionsMenu = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement)
  await userEvent.click(await canvas.findByRole('button', { name: 'Account options' }))
}

const meta = {
  title: 'Components/LinkedAccounts/LinkedAccountGridItem',
  component: LinkedAccountGridItem,
  decorators: [
    Story => (
      <GridList aria-label='Linked accounts'>
        <Story />
      </GridList>
    ),
  ],
} satisfies Meta<typeof LinkedAccountGridItem>

export default meta

type Story = StoryObj<typeof meta>

// Custom accounts still let a user add a missing opening balance manually.
export const CustomAccountMenuOpen: Story = {
  args: { account: CUSTOM_ACCOUNT_MISSING_OPENING_BALANCE },
  play: openAccountOptionsMenu,
}

// Plaid accounts get their opening balance from the institution, so the action is hidden.
export const PlaidAccountMenuOpen: Story = {
  args: { account: PLAID_ACCOUNT_MISSING_OPENING_BALANCE },
  play: openAccountOptionsMenu,
}
