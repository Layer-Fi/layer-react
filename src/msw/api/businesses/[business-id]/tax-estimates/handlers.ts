import { type RequestHandler } from 'msw'

import { get as getTaxBanner } from '@msw/api/businesses/[business-id]/tax-estimates/banner/get'
import { get as getTaxDetails } from '@msw/api/businesses/[business-id]/tax-estimates/details/get'
import { get as getTaxOverview } from '@msw/api/businesses/[business-id]/tax-estimates/overview/get'
import { get as getTaxPayments } from '@msw/api/businesses/[business-id]/tax-estimates/payments/get'
import { get as getTaxProfile } from '@msw/api/businesses/[business-id]/tax-estimates/profile/get'
import { get as getTaxSummary } from '@msw/api/businesses/[business-id]/tax-estimates/summary/get'

export const taxEstimatesHandlers: RequestHandler[] = [
  getTaxProfile.handler,
  getTaxOverview.handler,
  getTaxSummary.handler,
  getTaxDetails.handler,
  getTaxPayments.handler,
  getTaxBanner.handler,
]
