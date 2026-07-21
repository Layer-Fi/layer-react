import { Schema } from 'effect'

import {
  OverviewSchema,
  type Overview,
} from '@schemas/overview/overview'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { makeOverview } from '@fixtures/overview/mock'

const encodeOverviewConfiguration = Schema.encodeSync(OverviewSchema)

const toResponse = (overviewConfiguration: Overview) =>
  apiData(encodeOverviewConfiguration(overviewConfiguration))

export const get = createMockEndpoint<Overview, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/overview',
  resolve: ({ override: overviewConfiguration = makeOverview() }) => toResponse(overviewConfiguration),
})
