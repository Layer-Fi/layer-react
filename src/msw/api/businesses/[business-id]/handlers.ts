import { type RequestHandler } from 'msw'

import { accountingConfigurationHandlers } from '@msw/api/businesses/[business-id]/accounting-config/handlers'
import { bankAccountsHandlers } from '@msw/api/businesses/[business-id]/bank-accounts/handlers'
import { bookkeepingHandlers } from '@msw/api/businesses/[business-id]/bookkeeping/handlers'
import { callBookingsHandlers } from '@msw/api/businesses/[business-id]/call-bookings/handlers'
import { catalogHandlers } from '@msw/api/businesses/[business-id]/catalog/handlers'
import { categoriesHandlers } from '@msw/api/businesses/[business-id]/categories/handlers'
import { customAccountsHandlers } from '@msw/api/businesses/[business-id]/custom-accounts/handlers'
import { customersHandlers } from '@msw/api/businesses/[business-id]/customers/handlers'
import { externalAccountsHandlers } from '@msw/api/businesses/[business-id]/external-accounts/handlers'
import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { ledgerHandlers } from '@msw/api/businesses/[business-id]/ledger/handlers'
import { mileageHandlers } from '@msw/api/businesses/[business-id]/mileage/handlers'
import { plaidHandlers } from '@msw/api/businesses/[business-id]/plaid/handlers'
import { reportsHandlers } from '@msw/api/businesses/[business-id]/reports/handlers'
import { taxEstimatesHandlers } from '@msw/api/businesses/[business-id]/tax-estimates/handlers'
import { timeTrackingHandlers } from '@msw/api/businesses/[business-id]/time-tracking/handlers'
import { vendorsHandlers } from '@msw/api/businesses/[business-id]/vendors/handlers'

export const businessHandlers: RequestHandler[] = [
  getBusiness.handler,
  ...accountingConfigurationHandlers,
  ...bankAccountsHandlers,
  ...externalAccountsHandlers,
  ...plaidHandlers,
  ...categoriesHandlers,
  ...customAccountsHandlers,
  ...customersHandlers,
  ...vendorsHandlers,
  ...mileageHandlers,
  ...catalogHandlers,
  ...timeTrackingHandlers,
  ...ledgerHandlers,
  ...reportsHandlers,
  ...bookkeepingHandlers,
  ...callBookingsHandlers,
  ...taxEstimatesHandlers,
]
