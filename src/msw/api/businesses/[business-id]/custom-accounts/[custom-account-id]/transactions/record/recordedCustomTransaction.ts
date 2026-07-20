import { Schema } from 'effect'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { TransactionSource } from '@schemas/bankTransactions/base'
import { type RecordCustomTransaction, RecordCustomTransactionSchema } from '@schemas/customAccounts'
import { getCustomerName } from '@utils/customer'
import { getVendorName } from '@utils/vendor'

import { categorizationFromClassification } from '@msw/api/businesses/[business-id]/bank-transactions/categorizationFromClassification'
import { customAccountStore } from '@msw/api/businesses/[business-id]/custom-accounts/store'
import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { vendorStore } from '@msw/api/businesses/[business-id]/vendors/store'
import { makeBankTransaction } from '@fixtures/bankTransactions/mocks'

const decodeTransaction = Schema.decodeUnknownSync(RecordCustomTransactionSchema)

export const parseRecordCustomTransaction = async (request: Request): Promise<RecordCustomTransaction> => {
  const formData = await request.formData()
  const transaction = formData.get('transaction')
  return decodeTransaction(JSON.parse(typeof transaction === 'string' ? transaction : '{}'))
}

export const buildCustomBankTransaction = (
  transaction: RecordCustomTransaction,
  { id, customAccountId, existing }: { id: string, customAccountId: string, existing?: BankTransaction },
): BankTransaction => {
  const customer = transaction.customerId ? customerStore.findById(transaction.customerId) ?? null : null
  const vendor = transaction.vendorId ? vendorStore.findById(transaction.vendorId) ?? null : null
  const category = transaction.categorization ? categorizationFromClassification(transaction.categorization.category) : null

  return makeBankTransaction({
    ...existing,
    id,
    source: TransactionSource.CUSTOM,
    externalAccountId: customAccountId,
    sourceAccountId: customAccountId,
    sourceTransactionId: transaction.externalId ?? existing?.sourceTransactionId ?? `custom-txn-${id}`,
    accountName: customAccountStore.findById(customAccountId)?.accountName ?? existing?.accountName ?? null,
    date: new Date(`${transaction.date}T09:00:00-05:00`),
    direction: transaction.direction,
    amount: transaction.amount,
    description: transaction.description ?? existing?.description ?? null,
    memo: transaction.memo ?? existing?.memo ?? null,
    counterpartyName: customer ? getCustomerName(customer) : vendor ? getVendorName(vendor) : null,
    customer,
    vendor,
    category,
    categorizationStatus: category ? CategorizationStatus.CATEGORIZED : CategorizationStatus.READY_FOR_INPUT,
  })
}
