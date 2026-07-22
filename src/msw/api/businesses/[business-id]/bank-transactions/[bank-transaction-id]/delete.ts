import { type BankTransaction } from '@internal-types/bankTransactions'

import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { toRecordCustomAccountTransactionResponse } from '@msw/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/post'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const del = createMockEndpoint<BankTransaction, ReturnType<typeof toRecordCustomAccountTransactionResponse>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/bank-transactions/:bankTransactionId',
  resolve: ({ override, params }) => {
    if (override) return toRecordCustomAccountTransactionResponse(override)

    const bankTransactionId = String(params.bankTransactionId)
    const archived = findOrSeedBankTransaction(bankTransactionId)
    bankTransactionStore.deleteById(bankTransactionId)

    return toRecordCustomAccountTransactionResponse(archived)
  },
})
