import { type Meta, type StoryObj } from '@storybook/react-vite'

import { TaxEstimates } from '@views/TaxEstimates/TaxEstimates'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { get as getTaxProfile } from '@msw/api/businesses/[business-id]/tax-estimates/profile/get'
import { handlers } from '@msw/handlers'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { makeTaxProfile } from '@fixtures/taxEstimates/mocks'

const enableTaxEstimates = getAccountingConfiguration.mock(
  makeAccountingConfiguration({ enableTaxEstimates: true }),
)

const meta: Meta<typeof TaxEstimates> = {
  title: 'Views/TaxEstimates',
  component: TaxEstimates,
  parameters: { msw: { handlers: [enableTaxEstimates, ...handlers] } },
}

export default meta

type Story = StoryObj<typeof TaxEstimates>

export const Default: Story = {}

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
