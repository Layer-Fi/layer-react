import { Schema } from 'effect'

import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'
import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type RecordCustomTransaction, RecordCustomTransactionSchema } from '@schemas/customAccounts/recordCustomTransaction'
import { postWithFormData } from '@utils/api/authenticatedHttp'
import { useBankTransactionTriggerSuccess } from '@api/businesses/[business-id]/bank-transactions/triggerSuccess'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@api/businesses/[business-id]/custom-accounts/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export const RECORD_CUSTOM_ACCOUNT_TRANSACTION_TAG_KEY = `${CUSTOM_ACCOUNTS_TAG_KEY}:record-transaction`

const RECORD_TRANSACTION_PART_NAME = 'transaction'

export const RecordCustomAccountTransactionResponseSchema = UnwrappedDataResponseSchema(BankTransactionSchema)

export type RecordCustomAccountTransactionResponseEncoded = typeof RecordCustomAccountTransactionResponseSchema.Encoded

export type RecordCustomAccountTransactionBody = {
  transaction: RecordCustomTransaction
}

export type RecordCustomAccountTransactionArgs = RecordCustomAccountTransactionBody & {
  customAccountId: string
}

export const buildTransactionFormData = ({ transaction }: RecordCustomAccountTransactionBody) => {
  const formData = new FormData()
  formData.append(RECORD_TRANSACTION_PART_NAME, JSON.stringify(Schema.encodeSync(RecordCustomTransactionSchema)(transaction)))
  return formData
}

const recordCustomAccountTransaction = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: { businessId: string, customAccountId: string }, body?: RecordCustomAccountTransactionBody },
) => {
  const { businessId, customAccountId } = options?.params ?? ({} as { businessId: string, customAccountId: string })

  const endpoint = `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/transactions/record`
  return postWithFormData<RecordCustomAccountTransactionResponseEncoded>(
    endpoint,
    buildTransactionFormData(options?.body ?? ({} as RecordCustomAccountTransactionBody)),
    baseUrl,
    accessToken,
  )
}

export const usePostRecordCustomAccountTransaction = createMutationHook({
  tags: [RECORD_CUSTOM_ACCOUNT_TRANSACTION_TAG_KEY],
  request: recordCustomAccountTransaction,
  argToParams: ({ customAccountId }: RecordCustomAccountTransactionArgs) => ({ customAccountId }),
  argToBody: ({ transaction }: RecordCustomAccountTransactionArgs) => ({ transaction }),
  schema: RecordCustomAccountTransactionResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBankTransactionTriggerSuccess,
})
