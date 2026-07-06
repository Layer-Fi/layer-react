import { Schema } from 'effect'

import { type Vendor, VendorSchema } from '@schemas/vendor'

import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { vendors as defaultVendors } from '@fixtures/generated/vendors.gen'

const encodeVendor = Schema.encodeSync(VendorSchema)

const toResponse = (vendors: readonly Vendor[]) => ({
  data: vendors.map(vendor => encodeVendor(vendor)),
  meta: {
    pagination: {
      cursor: null,
      has_more: false,
      total_count: vendors.length,
    },
  },
})

export const get = createMockEndpoint<readonly Vendor[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/vendors',
  resolve: ({ override: vendors = defaultVendors, request }) => {
    const query = new URL(request.url).searchParams.get('q')?.toLowerCase()
    const filtered = query == null || query === ''
      ? vendors
      : vendors.filter(vendor =>
        [vendor.individualName, vendor.companyName, vendor.email]
          .some(field => field?.toLowerCase().includes(query)),
      )

    return toResponse(filtered)
  },
})
