import { Schema } from 'effect'

import { BankTransactionCounterpartyUpdateSchema } from '@schemas/bankTransactions/metadataUpdate'

import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { customers } from '@fixtures/generated/customers.gen'
import { vendors } from '@fixtures/generated/vendors.gen'

const decodeSetMetadataBody = Schema.decodeUnknownSync(BankTransactionCounterpartyUpdateSchema)

export const patch = createMockEndpoint<Record<string, never>, Record<string, never>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/bank-transactions/:bankTransactionId/metadata',
  resolve: async ({ override, request, params }) => {
    if (override) return override

    const body = decodeSetMetadataBody(await readRequestJson(request))

    bankTransactionStore.save({
      ...findOrSeedBankTransaction(params.bankTransactionId as string),
      customer: customers.find(customer => customer.id === body.customerId) ?? null,
      vendor: vendors.find(vendor => vendor.id === body.vendorId) ?? null,
    })

    return {}
  },
})
