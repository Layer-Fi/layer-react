import { Schema } from 'effect'

import { type BankTransaction, type BankTransactionMetadata } from '@internal-types/bankTransactions'
import { BankTransactionMetadataUpdateSchema } from '@schemas/bankTransactions/metadataUpdate'

import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { vendorStore } from '@msw/api/businesses/[business-id]/vendors/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const decodeMetadataUpdate = Schema.decodeUnknownSync(BankTransactionMetadataUpdateSchema)

const toResponse = (metadata: BankTransactionMetadata) => apiData(metadata)

export const patch = createMockEndpoint<BankTransactionMetadata, ReturnType<typeof toResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/bank-transactions/:bankTransactionId/metadata',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const { memo, customerId, vendorId } = decodeMetadataUpdate(await readRequestJson(request))

    // Partial update: only fields present in the body are touched.
    const updated: BankTransaction = {
      ...findOrSeedBankTransaction(params.bankTransactionId as string),
      ...(memo !== undefined && { memo }),
      ...(customerId !== undefined && { customer: customerStore.findById(customerId ?? '') ?? null }),
      ...(vendorId !== undefined && { vendor: vendorStore.findById(vendorId ?? '') ?? null }),
    }
    bankTransactionStore.save(updated)

    return toResponse({ memo: updated.memo ?? null })
  },
})
