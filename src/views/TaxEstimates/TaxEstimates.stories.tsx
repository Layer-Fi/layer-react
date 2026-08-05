import { type Meta, type StoryObj } from '@storybook/react-vite'

import { TaxEstimates } from '@views/TaxEstimates/TaxEstimates'

import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { makeTaxBanner, makeTaxProfile } from '@fixtures/taxEstimates/mocks'
import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { get as getTaxBanner } from '@msw/api/businesses/[business-id]/tax-estimates/banner/get'
import { get as getTaxProfile } from '@msw/api/businesses/[business-id]/tax-estimates/profile/get'
import { handlers } from '@msw/handlers'

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

export const Onboarding: Story = {
  parameters: {
    msw: {
      handlers: [
        enableTaxEstimates,
        getTaxProfile.mock(makeTaxProfile({ userHasSavedTaxProfile: false, usConfiguration: null })),
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
