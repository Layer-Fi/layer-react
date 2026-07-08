import { type RequestHandler } from 'msw'

import { accountingConfigurationHandlers } from '@msw/api/businesses/[business-id]/accounting-config/handlers'
import { bankAccountsHandlers } from '@msw/api/businesses/[business-id]/bank-accounts/handlers'
import { catalogHandlers } from '@msw/api/businesses/[business-id]/catalog/handlers'
import { customAccountsHandlers } from '@msw/api/businesses/[business-id]/custom-accounts/handlers'
import { customersHandlers } from '@msw/api/businesses/[business-id]/customers/handlers'
import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { mileageHandlers } from '@msw/api/businesses/[business-id]/mileage/handlers'
import { timeTrackingHandlers } from '@msw/api/businesses/[business-id]/time-tracking/handlers'
import { vendorsHandlers } from '@msw/api/businesses/[business-id]/vendors/handlers'

export const businessHandlers: RequestHandler[] = [
  getBusiness.handler,
  ...accountingConfigurationHandlers,
  ...bankAccountsHandlers,
  ...customAccountsHandlers,
  ...customersHandlers,
  ...vendorsHandlers,
  ...mileageHandlers,
  ...catalogHandlers,
  ...timeTrackingHandlers,
]
