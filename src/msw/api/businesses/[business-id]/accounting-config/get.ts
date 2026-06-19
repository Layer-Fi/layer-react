import { Schema } from 'effect'

import {
  AccountingConfigurationSchema,
  type AccountingConfigurationSchemaType,
} from '@schemas/accountingConfiguration'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'

const encodeAccountingConfiguration = Schema.encodeSync(AccountingConfigurationSchema)

const toResponse = (accountingConfiguration: AccountingConfigurationSchemaType) =>
  apiData(encodeAccountingConfiguration(accountingConfiguration))

export const get = createMockEndpoint<AccountingConfigurationSchemaType, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/accounting-config',
  resolve: ({ override: accountingConfiguration = makeAccountingConfiguration() }) => toResponse(accountingConfiguration),
})
