import { Schema } from 'effect'

import { type Business, BusinessSchema } from '@schemas/business'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeBusiness } from '@fixtures/business/mocks'

const encodeBusiness = Schema.encodeSync(BusinessSchema)

const toResponse = (business: Business) =>
  apiData(encodeBusiness(business))

export const get = createMockEndpoint<Business, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId',
  resolve: ({ override: business = makeBusiness() }) => toResponse(business),
})
