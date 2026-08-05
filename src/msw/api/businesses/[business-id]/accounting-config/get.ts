import { Schema } from 'effect'

import {
  AccountingConfigurationSchema,
  type AccountingConfigurationSchemaType,
} from '@schemas/features/business/accountingConfiguration'

import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeAccountingConfiguration = Schema.encodeSync(AccountingConfigurationSchema)

const toResponse = (accountingConfiguration: AccountingConfigurationSchemaType) =>
  apiData(encodeAccountingConfiguration(accountingConfiguration))

export const get = createMockEndpoint<AccountingConfigurationSchemaType, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/accounting-config',
  resolve: ({ override: accountingConfiguration = makeAccountingConfiguration() }) => toResponse(accountingConfiguration),
})
