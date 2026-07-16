import { type BankTransaction } from '@internal-types/bankTransactions'

import { bankTransactionStore } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { toRecordCustomAccountTransactionResponse } from '@msw/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/post'
import { buildCustomBankTransaction, parseRecordCustomTransaction } from '@msw/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/recordedCustomTransaction'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const patch = createMockEndpoint<BankTransaction, ReturnType<typeof toRecordCustomAccountTransactionResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/custom-accounts/:customAccountId/transactions/:transactionId',
  resolve: async ({ override, request, params }) => {
    if (override) return toRecordCustomAccountTransactionResponse(override)

    const transactionId = String(params.transactionId)
    const transaction = await parseRecordCustomTransaction(request)
    const bankTransaction = buildCustomBankTransaction(transaction, {
      id: transactionId,
      customAccountId: String(params.customAccountId),
      existing: bankTransactionStore.findById(transactionId),
    })
    bankTransactionStore.save(bankTransaction)

    return toRecordCustomAccountTransactionResponse(bankTransaction)
  },
})
