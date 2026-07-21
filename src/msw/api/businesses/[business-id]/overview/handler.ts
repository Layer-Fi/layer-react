import { type RequestHandler } from 'msw'

import { get as getOverviewConfiguration } from '@msw/api/businesses/[business-id]/overview/get'

export const overviewConfigurationHandlers: RequestHandler[] = [
  getOverviewConfiguration.handler,
]
