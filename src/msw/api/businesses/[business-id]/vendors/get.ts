import { Schema } from 'effect'

import { type Vendor, VendorSchema } from '@schemas/vendor'

import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesQuery } from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { vendors as defaultVendors } from '@fixtures/generated/vendors.gen'

const encodeVendor = Schema.encodeSync(VendorSchema)

const toResponse = (vendors: readonly Vendor[], request: Request) =>
  paginatedApiData(vendors.map(vendor => encodeVendor(vendor)), request)

const filterVendors = createListFilter<Vendor>({
  q: matchesQuery(vendor => [vendor.individualName, vendor.companyName, vendor.email]),
})

export const get = createMockEndpoint<readonly Vendor[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/vendors',
  resolve: ({ override: vendors = defaultVendors, request }) =>
    toResponse(filterVendors(vendors, request), request),
})
