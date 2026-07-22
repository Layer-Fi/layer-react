import { Schema } from 'effect'

import { type Vendor, VendorSchema } from '@schemas/vendor'

import { vendorStore } from '@msw/api/businesses/[business-id]/vendors/store'
import { vendorFromUpsertRequest } from '@msw/api/businesses/[business-id]/vendors/vendorFromUpsertRequest'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreCreateResolver } from '@msw/utils/createStoreResolvers'
import { makeVendor } from '@fixtures/vendors/mocks'

const encodeVendor = Schema.encodeSync(VendorSchema)

export const toCreateVendorResponse = (vendor: Vendor) =>
  apiData(encodeVendor(vendor))

export const post = createMockEndpoint<Vendor, ReturnType<typeof toCreateVendorResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/vendors',
  resolve: createStoreCreateResolver({
    store: vendorStore,
    makeBase: id => makeVendor({ id, individualName: null, companyName: null }),
    fromRequest: vendorFromUpsertRequest,
    toResponse: toCreateVendorResponse,
  }),
})
