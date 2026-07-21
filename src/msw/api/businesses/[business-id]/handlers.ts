import { type RequestHandler } from 'msw'

import { accountingConfigurationHandlers } from '@msw/api/businesses/[business-id]/accounting-config/handlers'
import { bankAccountsHandlers } from '@msw/api/businesses/[business-id]/bank-accounts/handlers'
import { bankTransactionsHandlers } from '@msw/api/businesses/[business-id]/bank-transactions/handlers'
import { bookkeepingHandlers } from '@msw/api/businesses/[business-id]/bookkeeping/handlers'
import { callBookingsHandlers } from '@msw/api/businesses/[business-id]/call-bookings/handlers'
import { catalogHandlers } from '@msw/api/businesses/[business-id]/catalog/handlers'
import { categoriesHandlers } from '@msw/api/businesses/[business-id]/categories/handlers'
import { categorizationRulesHandlers } from '@msw/api/businesses/[business-id]/categorization-rules/handlers'
import { counterpartiesHandlers } from '@msw/api/businesses/[business-id]/counterparties/handlers'
import { customAccountsHandlers } from '@msw/api/businesses/[business-id]/custom-accounts/handlers'
import { customersHandlers } from '@msw/api/businesses/[business-id]/customers/handlers'
import { externalAccountsHandlers } from '@msw/api/businesses/[business-id]/external-accounts/handlers'
import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { invoicesHandlers } from '@msw/api/businesses/[business-id]/invoices/handlers'
import { ledgerHandlers } from '@msw/api/businesses/[business-id]/ledger/handlers'
import { mileageHandlers } from '@msw/api/businesses/[business-id]/mileage/handlers'
import { plaidHandlers } from '@msw/api/businesses/[business-id]/plaid/handlers'
import { reportsHandlers } from '@msw/api/businesses/[business-id]/reports/handlers'
import { stripeHandlers } from '@msw/api/businesses/[business-id]/stripe/handlers'
import { tagsHandlers } from '@msw/api/businesses/[business-id]/tags/handlers'
import { tasksHandlers } from '@msw/api/businesses/[business-id]/tasks/handlers'
import { taxEstimatesHandlers } from '@msw/api/businesses/[business-id]/tax-estimates/handlers'
import { timeTrackingHandlers } from '@msw/api/businesses/[business-id]/time-tracking/handlers'
import { vendorsHandlers } from '@msw/api/businesses/[business-id]/vendors/handlers'
import { overviewConfigurationHandlers } from './overview/handler'

export const businessHandlers: RequestHandler[] = [
  getBusiness.handler,
  ...accountingConfigurationHandlers,
  ...bankAccountsHandlers,
  ...bankTransactionsHandlers,
  ...externalAccountsHandlers,
  ...plaidHandlers,
  ...categoriesHandlers,
  ...categorizationRulesHandlers,
  ...counterpartiesHandlers,
  ...customAccountsHandlers,
  ...customersHandlers,
  ...vendorsHandlers,
  ...mileageHandlers,
  ...catalogHandlers,
  ...timeTrackingHandlers,
  ...ledgerHandlers,
  ...overviewConfigurationHandlers,
  ...invoicesHandlers,
  ...stripeHandlers,
  ...reportsHandlers,
  ...bookkeepingHandlers,
  ...callBookingsHandlers,
  ...tagsHandlers,
  ...tasksHandlers,
  ...taxEstimatesHandlers,
]
