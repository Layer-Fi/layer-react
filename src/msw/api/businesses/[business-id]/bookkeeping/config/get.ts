import { Schema } from 'effect'

import { type BookkeepingConfiguration, BookkeepingConfigurationSchema } from '@schemas/bookkeepingConfiguration'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeBookkeepingConfiguration } from '@fixtures/bookkeeping/mocks'

const encodeBookkeepingConfiguration = Schema.encodeSync(BookkeepingConfigurationSchema)

const toResponse = (config: BookkeepingConfiguration) => apiData(encodeBookkeepingConfiguration(config))

export const get = createMockEndpoint<BookkeepingConfiguration, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bookkeeping/config',
  resolve: ({ override: config = makeBookkeepingConfiguration() }) => toResponse(config),
})
