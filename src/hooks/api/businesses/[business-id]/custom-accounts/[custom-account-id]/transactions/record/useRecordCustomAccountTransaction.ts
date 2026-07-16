import { Schema } from 'effect'

import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'
import { type RecordCustomTransaction, RecordCustomTransactionSchema } from '@schemas/customAccounts'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { postWithFormData } from '@utils/api/authenticatedHttp'
import { useBankTransactionTriggerSuccess } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/useBankTransactionTriggerSuccess'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const RECORD_CUSTOM_ACCOUNT_TRANSACTION_TAG_KEY = `${CUSTOM_ACCOUNTS_TAG_KEY}:record-transaction`

const RECORD_TRANSACTION_PART_NAME = 'transaction'

const RecordCustomAccountTransactionResponseSchema = UnwrappedDataResponseSchema(BankTransactionSchema)

type RecordCustomAccountTransactionParams = {
  businessId: string
  customAccountId: string
}

type RecordCustomAccountTransactionBody = {
  transaction: RecordCustomTransaction
}

type RecordCustomAccountTransactionArgs = RecordCustomAccountTransactionBody & {
  customAccountId: string
}

const recordCustomAccountTransaction = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: RecordCustomAccountTransactionParams, body?: RecordCustomAccountTransactionBody },
) => {
  const { businessId, customAccountId } = options?.params ?? ({} as RecordCustomAccountTransactionParams)
  const { transaction } = options?.body ?? ({} as RecordCustomAccountTransactionBody)

  const formData = new FormData()
  formData.append(
    RECORD_TRANSACTION_PART_NAME,
    JSON.stringify(Schema.encodeSync(RecordCustomTransactionSchema)(transaction)),
  )

  const endpoint = `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/transactions/record`
  return postWithFormData<typeof RecordCustomAccountTransactionResponseSchema.Encoded>(
    endpoint,
    formData,
    baseUrl,
    accessToken,
  )
}

export const useRecordCustomAccountTransaction = createMutationHook({
  tags: [RECORD_CUSTOM_ACCOUNT_TRANSACTION_TAG_KEY],
  request: recordCustomAccountTransaction,
  argToParams: ({ customAccountId }: RecordCustomAccountTransactionArgs) => ({ customAccountId }),
  argToBody: ({ transaction }: RecordCustomAccountTransactionArgs) => ({ transaction }),
  schema: RecordCustomAccountTransactionResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBankTransactionTriggerSuccess,
})
