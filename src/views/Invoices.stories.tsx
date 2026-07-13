import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Invoices } from '@components/Invoices/Invoices'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { handlers } from '@msw/handlers'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'

const invoicesStoryHandlers = [
  getAccountingConfiguration.mock(makeAccountingConfiguration({ enableStripeOnboarding: true })),
  ...handlers,
]

const meta: Meta<typeof Invoices> = {
  title: 'Views/Invoices',
  component: Invoices,
  parameters: {
    msw: { handlers: invoicesStoryHandlers },
  },
}

export default meta

type Story = StoryObj<typeof Invoices>

export const Default: Story = {}
