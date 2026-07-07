import { type RequestHandler } from 'msw'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'

export const accountingConfigurationHandlers: RequestHandler[] = [
  getAccountingConfiguration.handler,
]
