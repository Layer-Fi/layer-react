import { Schema } from 'effect'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { TransactionSource } from '@schemas/bankTransactions/base'
import type { Categorization, Classification } from '@schemas/categorization'
import { type RecordCustomTransaction, RecordCustomTransactionSchema } from '@schemas/customAccounts'
import { getCustomerName, getVendorName } from '@utils/customerVendor'

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

const toCategorization = (classification: Classification): Categorization => {
  if (classification.type === 'Exclusion') {
    return { type: 'Exclusion', id: classification.exclusionType, category: classification.exclusionType, displayName: classification.exclusionType, description: null }
  }

  const identifier = classification.type === 'StableName' ? classification.stableName : classification.id
  return { type: 'Account', id: identifier, stableName: classification.type === 'StableName' ? classification.stableName : null, category: identifier, displayName: identifier, description: null }
}

export const buildCustomBankTransaction = (
  transaction: RecordCustomTransaction,
  { id, customAccountId, existing }: { id: string, customAccountId: string, existing?: BankTransaction },
): BankTransaction => {
  const customer = transaction.customerId ? customerStore.findById(transaction.customerId) ?? null : null
  const vendor = transaction.vendorId ? vendorStore.findById(transaction.vendorId) ?? null : null
  const category = transaction.categorization ? toCategorization(transaction.categorization.category) : null

  return makeBankTransaction({
    ...existing,
    id,
    source: TransactionSource.CUSTOM,
    sourceAccountId: customAccountId,
    accountName: customAccountStore.findById(customAccountId)?.accountName ?? existing?.accountName ?? null,
    date: new Date(`${transaction.date}T00:00:00`),
    direction: transaction.direction,
    amount: transaction.amount,
    description: transaction.description,
    counterpartyName: customer ? getCustomerName(customer) : vendor ? getVendorName(vendor) : null,
    customer,
    vendor,
    category,
    categorizationStatus: category ? CategorizationStatus.CATEGORIZED : CategorizationStatus.READY_FOR_INPUT,
  })
}
