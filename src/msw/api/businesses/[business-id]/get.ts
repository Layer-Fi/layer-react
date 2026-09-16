import { Schema } from 'effect'

import { type Business, BusinessSchema } from '@schemas/features/business/business'

import { makeBusiness } from '@fixtures/business/mocks'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeBusiness = Schema.encodeSync(BusinessSchema)

const toResponse = (business: Business) =>
  apiData(encodeBusiness(business))

export const get = createMockEndpoint<Business, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId',
  resolve: ({ override: business = makeBusiness() }) => toResponse(business),
})
