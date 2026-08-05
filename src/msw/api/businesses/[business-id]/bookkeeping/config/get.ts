import { Schema } from 'effect'

import { type BookkeepingConfiguration, BookkeepingConfigurationSchema } from '@schemas/features/bookkeeping/bookkeepingConfiguration'

import { makeBookkeepingConfiguration } from '@fixtures/bookkeeping/mocks'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeBookkeepingConfiguration = Schema.encodeSync(BookkeepingConfigurationSchema)

const toResponse = (config: BookkeepingConfiguration) => apiData(encodeBookkeepingConfiguration(config))

export const get = createMockEndpoint<BookkeepingConfiguration, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bookkeeping/config',
  resolve: ({ override: config = makeBookkeepingConfiguration() }) => toResponse(config),
})
