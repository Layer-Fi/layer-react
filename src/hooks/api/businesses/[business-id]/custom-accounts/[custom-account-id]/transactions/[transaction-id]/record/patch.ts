import { patchWithFormData } from '@utils/shared/api/authenticatedHttp'
import { useBankTransactionTriggerSuccess } from '@api/businesses/[business-id]/bank-transactions/triggerSuccess'
import {
  buildTransactionFormData,
  RECORD_CUSTOM_ACCOUNT_TRANSACTION_TAG_KEY,
  type RecordCustomAccountTransactionArgs,
  type RecordCustomAccountTransactionBody,
  type RecordCustomAccountTransactionResponseEncoded,
  RecordCustomAccountTransactionResponseSchema,
} from '@api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/post'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const updateCustomAccountTransaction = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: { businessId: string, customAccountId: string, transactionId: string }, body?: RecordCustomAccountTransactionBody },
) => {
  const { businessId, customAccountId, transactionId } = options?.params
    ?? ({} as { businessId: string, customAccountId: string, transactionId: string })

  const endpoint = `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/transactions/${transactionId}/record`
  return patchWithFormData<RecordCustomAccountTransactionResponseEncoded>(
    endpoint,
    buildTransactionFormData(options?.body ?? ({} as RecordCustomAccountTransactionBody)),
    baseUrl,
    accessToken,
  )
}

export const usePatchRecordCustomAccountTransaction = createMutationHook({
  tags: [RECORD_CUSTOM_ACCOUNT_TRANSACTION_TAG_KEY],
  request: updateCustomAccountTransaction,
  keyParams: ['transactionId'],
  argToParams: ({ customAccountId }: RecordCustomAccountTransactionArgs) => ({ customAccountId }),
  argToBody: ({ transaction }: RecordCustomAccountTransactionArgs) => ({ transaction }),
  schema: RecordCustomAccountTransactionResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBankTransactionTriggerSuccess,
})
