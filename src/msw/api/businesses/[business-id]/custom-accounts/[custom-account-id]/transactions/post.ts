import { Schema } from 'effect'

import { Direction } from '@internal-types/general'
import { type BankTransactionDataOnly, BankTransactionDataOnlySchema } from '@schemas/bankTransactions/bankTransactionDataOnly'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import { CustomTransactionSchema } from '@schemas/customAccounts'

import { bankTransactionStore } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { makeBankTransaction } from '@fixtures/bankTransactions/mocks'

const CreateCustomAccountTransactionsBodySchema = Schema.Struct({
  transactions: Schema.Array(CustomTransactionSchema),
})

const decodeBody = Schema.decodeUnknownSync(CreateCustomAccountTransactionsBodySchema)
const encodeResponse = Schema.encodeSync(Schema.Array(BankTransactionDataOnlySchema))

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/custom-accounts/:customAccountId/transactions',
  resolve: async (
    { override, request, params }:
    { override?: readonly BankTransactionDataOnly[], request: Request, params: { customAccountId?: string | readonly string[] } },
  ) => {
    if (override) return apiData(encodeResponse(override))

    const customAccountId = String(params.customAccountId)
    const { transactions } = decodeBody(await readRequestJson(request))

    const created = transactions.map((transaction) => {
      const bankTransaction = makeBankTransaction({
        id: crypto.randomUUID(),
        sourceAccountId: customAccountId,
        sourceTransactionId: transaction.externalId ?? `custom-txn-${crypto.randomUUID()}`,
        date: new Date(transaction.date),
        direction: transaction.direction === Direction.CREDIT
          ? BankTransactionDirection.Credit
          : BankTransactionDirection.Debit,
        amount: transaction.amount,
        counterpartyName: null,
        description: transaction.description,
        referenceNumber: transaction.referenceNumber ?? null,
      })
      bankTransactionStore.save(bankTransaction)

      return bankTransaction
    })

    const responseItems: BankTransactionDataOnly[] = created.map(transaction => ({
      id: transaction.id,
      businessId: transaction.businessId,
      source: 'CUSTOM',
      sourceTransactionId: transaction.sourceTransactionId,
      sourceAccountId: transaction.sourceAccountId,
      importedAt: new Date(),
      date: transaction.date,
      direction: transaction.direction,
      amount: transaction.amount,
      counterpartyName: transaction.counterpartyName,
      description: transaction.description,
      accountName: transaction.accountName,
      categorizationStatus: transaction.categorizationStatus,
      metadata: null,
      memo: null,
      referenceNumber: transaction.referenceNumber,
      customerId: null,
      vendorId: null,
      counterpartyId: null,
      taxCode: null,
    }))

    return apiData(encodeResponse(responseItems))
  },
})
