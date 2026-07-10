import { type RequestHandler } from 'msw'

import { get as getTaxProfile } from '@msw/api/businesses/[business-id]/tax-estimates/profile/get'
import { get as getTaxSummary } from '@msw/api/businesses/[business-id]/tax-estimates/summary/get'

export const taxEstimatesHandlers: RequestHandler[] = [
  getTaxProfile.handler,
  getTaxSummary.handler,
]
