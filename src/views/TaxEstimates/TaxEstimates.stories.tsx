import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { TaxEstimates } from '@views/TaxEstimates/TaxEstimates'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { get as getTaxBanner } from '@msw/api/businesses/[business-id]/tax-estimates/banner/get'
import { get as getTaxProfile } from '@msw/api/businesses/[business-id]/tax-estimates/profile/get'
import { handlers } from '@msw/handlers'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { makeTaxBanner, makeTaxProfile } from '@fixtures/taxEstimates/mocks'

const enableTaxEstimates = getAccountingConfiguration.mock(
  makeAccountingConfiguration({ enableTaxEstimates: true }),
)

const meta: Meta<typeof TaxEstimates> = {
  title: 'Views/TaxEstimates',
  tags: ['public-api'],
  component: TaxEstimates,
  parameters: { msw: { handlers: [enableTaxEstimates, ...handlers] } },
}

export default meta

type Story = StoryObj<typeof TaxEstimates>

export const Default: Story = {}

// The banner only renders when the year has uncategorized transactions. That's real behavior worth
// keeping on `Default`, but it's noise in a screenshot of the estimates themselves.
const noUncategorizedTransactions = getTaxBanner.mock({
  ...makeTaxBanner(FIXTURE_YEAR),
  totalUncategorizedCount: 0,
})

export const DocsDefault: Story = {
  tags: ['!public-api', 'docs-screenshot'],
  parameters: {
    msw: { handlers: [enableTaxEstimates, noUncategorizedTransactions, ...handlers] },
  },
}

export const DocsPayments: Story = {
  tags: ['!public-api', 'docs-screenshot'],
  parameters: {
    msw: { handlers: [enableTaxEstimates, noUncategorizedTransactions, ...handlers] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const payments = await canvas.findByRole('radio', { name: 'Payments' })
    await userEvent.click(payments)
    await canvas.findByLabelText('Tax Payments')
    // The click leaves a focus ring on the toggle, which reads as a selection state in the shot.
    payments.blur()
  },
}

// Keeps the fixture's configuration so the form renders filled out; the empty form reads as a
// column of blank inputs in the docs image.
export const Onboarding: Story = {
  tags: ['docs-screenshot'],
  parameters: {
    msw: {
      handlers: [
        enableTaxEstimates,
        getTaxProfile.mock(makeTaxProfile({ userHasSavedTaxProfile: false })),
        ...handlers,
      ],
    },
  },
}

export const FeatureDisabled: Story = {
  parameters: {
    msw: {
      handlers: [
        getAccountingConfiguration.mock(makeAccountingConfiguration({ enableTaxEstimates: false })),
        ...handlers,
      ],
    },
  },
}
