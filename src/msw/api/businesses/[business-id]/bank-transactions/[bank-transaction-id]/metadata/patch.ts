import { Schema } from 'effect'

import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { customers } from '@fixtures/generated/customers.gen'
import { vendors } from '@fixtures/generated/vendors.gen'

const SetMetadataBodySchema = Schema.Struct({
  vendor_id: Schema.NullOr(Schema.String),
  customer_id: Schema.NullOr(Schema.String),
})

const decodeSetMetadataBody = Schema.decodeUnknownSync(SetMetadataBodySchema)

/*
 * Assigns a counterparty by id. Ids are resolved against the generated
 * customer/vendor pools, mirroring how the pooled counterparties were drawn
 * into the transaction fixtures in the first place.
 */
export const patch = createMockEndpoint<Record<string, never>, Record<string, never>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/bank-transactions/:bankTransactionId/metadata',
  resolve: async ({ override, request, params }) => {
    if (override) return override

    const body = decodeSetMetadataBody(await readRequestJson(request))

    bankTransactionStore.save({
      ...findOrSeedBankTransaction(params.bankTransactionId as string),
      customer: customers.find(customer => customer.id === body.customer_id) ?? null,
      vendor: vendors.find(vendor => vendor.id === body.vendor_id) ?? null,
    })

    return {}
  },
})
