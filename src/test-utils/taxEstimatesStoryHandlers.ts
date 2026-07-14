import { get as getTaxBanner } from '@msw/api/businesses/[business-id]/tax-estimates/banner/get'
import { get as getTaxDetails } from '@msw/api/businesses/[business-id]/tax-estimates/details/get'
import { get as getTaxOverview } from '@msw/api/businesses/[business-id]/tax-estimates/overview/get'
import { get as getTaxPayments } from '@msw/api/businesses/[business-id]/tax-estimates/payments/get'
import { get as getTaxSummary } from '@msw/api/businesses/[business-id]/tax-estimates/summary/get'
import {
  deriveTaxBanner,
  deriveTaxDetails,
  deriveTaxOverview,
  deriveTaxPayments,
  deriveTaxSummary,
  type TaxScenario,
} from '@fixtures/taxEstimates/scenario'

/** Serves every tax-estimate endpoint from one scenario so the sections stay in agreement. */
export const taxEstimatesStoryHandlers = (scenario: TaxScenario) => [
  getTaxOverview.mock(deriveTaxOverview(scenario)),
  getTaxSummary.mock(deriveTaxSummary(scenario)),
  getTaxDetails.mock(deriveTaxDetails(scenario)),
  getTaxPayments.mock(deriveTaxPayments(scenario)),
  getTaxBanner.mock(deriveTaxBanner(scenario)),
]
