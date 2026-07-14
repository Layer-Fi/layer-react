import { type Meta, type StoryObj } from '@storybook/react-vite'

import { TaxEstimates } from '@views/TaxEstimates/TaxEstimates'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { get as getTaxBanner } from '@msw/api/businesses/[business-id]/tax-estimates/banner/get'
import { get as getTaxProfile } from '@msw/api/businesses/[business-id]/tax-estimates/profile/get'
import { handlers } from '@msw/handlers'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { makeTaxProfile } from '@fixtures/taxEstimates/mocks'
import { deriveTaxBanner, makeTaxScenario } from '@fixtures/taxEstimates/scenario'

const enableTaxEstimates = getAccountingConfiguration.mock(
  makeAccountingConfiguration({ enableTaxEstimates: true }),
)

const meta: Meta<typeof TaxEstimates> = {
  title: 'Views/Tax estimates',
  component: TaxEstimates,
  parameters: { msw: { handlers: [enableTaxEstimates, ...handlers] } },
}

export default meta

type Story = StoryObj<typeof TaxEstimates>

export const Default: Story = {}

export const WithUncategorizedBanner: Story = {
  parameters: {
    msw: {
      handlers: [
        enableTaxEstimates,
        getTaxBanner.mock(deriveTaxBanner(makeTaxScenario({
          year: FIXTURE_YEAR,
          uncategorized: {
            count: 6,
            moneyIn: 420_000,
            moneyOut: 150_000,
            earliestAt: new Date(FIXTURE_YEAR, 9, 3),
            latestAt: new Date(FIXTURE_YEAR, 11, 18),
          },
        }))),
        ...handlers,
      ],
    },
  },
}

export const Onboarding: Story = {
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
