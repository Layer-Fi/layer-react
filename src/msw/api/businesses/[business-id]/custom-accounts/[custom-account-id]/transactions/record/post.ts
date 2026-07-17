import { Schema } from 'effect'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'

import { bankTransactionStore } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { buildCustomBankTransaction, parseRecordCustomTransaction } from '@msw/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/recordedCustomTransaction'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeBankTransaction = Schema.encodeSync(BankTransactionSchema)

export const toRecordCustomAccountTransactionResponse = (bankTransaction: BankTransaction) =>
  apiData(encodeBankTransaction(bankTransaction))

export const post = createMockEndpoint<BankTransaction, ReturnType<typeof toRecordCustomAccountTransactionResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/custom-accounts/:customAccountId/transactions/record',
  resolve: async ({ override, request, params }) => {
    if (override) return toRecordCustomAccountTransactionResponse(override)

    const transaction = await parseRecordCustomTransaction(request)
    const existing = transaction.externalId
      ? bankTransactionStore.all().find(saved => saved.sourceTransactionId === transaction.externalId)
      : undefined
    const bankTransaction = buildCustomBankTransaction(transaction, {
      id: existing?.id ?? crypto.randomUUID(),
      customAccountId: String(params.customAccountId),
      existing,
    })
    bankTransactionStore.save(bankTransaction)

    return toRecordCustomAccountTransactionResponse(bankTransaction)
  },
})
