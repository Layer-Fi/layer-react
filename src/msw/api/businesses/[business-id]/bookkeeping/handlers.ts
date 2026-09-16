import { type RequestHandler } from 'msw'

import { get as getBookkeepingConfiguration } from '@msw/api/businesses/[business-id]/bookkeeping/config/get'
import { get as getBookkeepingPeriods } from '@msw/api/businesses/[business-id]/bookkeeping/periods/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'

export const bookkeepingHandlers: RequestHandler[] = [
  getBookkeepingStatus.handler,
  getBookkeepingPeriods.handler,
  getBookkeepingConfiguration.handler,
]
