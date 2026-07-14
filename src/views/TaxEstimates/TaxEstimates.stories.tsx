import { type Meta, type StoryObj } from '@storybook/react-vite'

import { TaxEstimates } from '@views/TaxEstimates/TaxEstimates'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { get as getTaxProfile } from '@msw/api/businesses/[business-id]/tax-estimates/profile/get'
import { handlers } from '@msw/handlers'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { makeTaxProfile } from '@fixtures/taxEstimates/mocks'
import { makeTaxScenario } from '@fixtures/taxEstimates/scenario'
import { taxEstimatesStoryHandlers } from '@test-utils/taxEstimatesStoryHandlers'

const enableTaxEstimates = getAccountingConfiguration.mock(
  makeAccountingConfiguration({ enableTaxEstimates: true }),
)

const meta: Meta<typeof TaxEstimates> = {
  title: 'Views/Tax estimates',
  component: TaxEstimates,
  // The default tax-estimate handlers already derive every section from one shared
  // scenario, so Estimates and Payments reconcile out of the box.
  parameters: { msw: { handlers: [enableTaxEstimates, ...handlers] } },
}

export default meta

type Story = StoryObj<typeof TaxEstimates>

/** Onboarded business. Toggle between the Estimates and Payments tabs; the numbers agree. */
export const Default: Story = {}

/** Uncategorized activity surfaces the review banner above the tabs. */
export const WithUncategorizedBanner: Story = {
  parameters: {
    msw: {
      handlers: [
        enableTaxEstimates,
        ...taxEstimatesStoryHandlers(makeTaxScenario({
          uncategorized: {
            count: 6,
            moneyIn: 420_000,
            moneyOut: 150_000,
            earliestAt: new Date(FIXTURE_YEAR, 9, 3),
            latestAt: new Date(FIXTURE_YEAR, 11, 18),
          },
        })),
        ...handlers,
      ],
    },
  },
}

/** Feature enabled but no saved tax profile yet: the onboarding profile form. */
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

/** Feature not enabled for the business. */
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
