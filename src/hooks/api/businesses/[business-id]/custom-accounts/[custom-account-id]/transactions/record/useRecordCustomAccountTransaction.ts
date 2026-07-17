import { Schema } from 'effect'

import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'
import { type RecordCustomTransaction, RecordCustomTransactionSchema } from '@schemas/customAccounts'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { patchWithFormData, postWithFormData } from '@utils/api/authenticatedHttp'
import { useBankTransactionTriggerSuccess, useUpdateBankTransactionTriggerSuccess } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/useBankTransactionTriggerSuccess'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const RECORD_CUSTOM_ACCOUNT_TRANSACTION_TAG_KEY = `${CUSTOM_ACCOUNTS_TAG_KEY}:record-transaction`

const RECORD_TRANSACTION_PART_NAME = 'transaction'

const RecordCustomAccountTransactionResponseSchema = UnwrappedDataResponseSchema(BankTransactionSchema)

type RecordCustomAccountTransactionResponseEncoded = typeof RecordCustomAccountTransactionResponseSchema.Encoded

type RecordCustomAccountTransactionBody = {
  transaction: RecordCustomTransaction
}

const buildTransactionFormData = ({ transaction }: RecordCustomAccountTransactionBody) => {
  const formData = new FormData()
  formData.append(
    RECORD_TRANSACTION_PART_NAME,
    JSON.stringify(Schema.encodeSync(RecordCustomTransactionSchema)(transaction)),
  )
  return formData
}

export enum UpsertCustomAccountTransactionMode {
  Create = 'Create',
  Update = 'Update',
}

type CreateParams = {
  businessId: string
  customAccountId: string
}

type CreateArgs = RecordCustomAccountTransactionBody & {
  customAccountId: string
}

const recordCustomAccountTransaction = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: CreateParams, body?: RecordCustomAccountTransactionBody },
) => {
  const { businessId, customAccountId } = options?.params ?? ({} as CreateParams)

  const endpoint = `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/transactions/record`
  return postWithFormData<RecordCustomAccountTransactionResponseEncoded>(
    endpoint,
    buildTransactionFormData(options?.body ?? ({} as RecordCustomAccountTransactionBody)),
    baseUrl,
    accessToken,
  )
}

export const useRecordCustomAccountTransaction = createMutationHook({
  tags: [RECORD_CUSTOM_ACCOUNT_TRANSACTION_TAG_KEY],
  request: recordCustomAccountTransaction,
  argToParams: ({ customAccountId }: CreateArgs) => ({ customAccountId }),
  argToBody: ({ transaction }: CreateArgs) => ({ transaction }),
  schema: RecordCustomAccountTransactionResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBankTransactionTriggerSuccess,
})

type UpdateParams = {
  businessId: string
  customAccountId: string
  transactionId: string
}

type UpdateArgs = RecordCustomAccountTransactionBody & {
  customAccountId: string
}

const updateCustomAccountTransaction = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: UpdateParams, body?: RecordCustomAccountTransactionBody },
) => {
  const { businessId, customAccountId, transactionId } = options?.params ?? ({} as UpdateParams)

  const endpoint = `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/transactions/${transactionId}`
  return patchWithFormData<RecordCustomAccountTransactionResponseEncoded>(
    endpoint,
    buildTransactionFormData(options?.body ?? ({} as RecordCustomAccountTransactionBody)),
    baseUrl,
    accessToken,
  )
}

const useUpdateCustomAccountTransaction = createMutationHook({
  tags: [RECORD_CUSTOM_ACCOUNT_TRANSACTION_TAG_KEY],
  request: updateCustomAccountTransaction,
  keyParams: ['transactionId'],
  argToParams: ({ customAccountId }: UpdateArgs) => ({ customAccountId }),
  argToBody: ({ transaction }: UpdateArgs) => ({ transaction }),
  schema: RecordCustomAccountTransactionResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const onUpdateSuccess = useUpdateBankTransactionTriggerSuccess()
    return bankTransaction => onUpdateSuccess(bankTransaction)
  },
})

type UseUpsertCustomAccountTransactionProps =
  | { mode: UpsertCustomAccountTransactionMode.Create }
  | { mode: UpsertCustomAccountTransactionMode.Update, transactionId: string }

export const useUpsertCustomAccountTransaction = (props: UseUpsertCustomAccountTransactionProps) => {
  const transactionId = props.mode === UpsertCustomAccountTransactionMode.Update ? props.transactionId : undefined

  const createResponse = useRecordCustomAccountTransaction()
  const updateResponse = useUpdateCustomAccountTransaction({ transactionId: transactionId ?? '' })

  return props.mode === UpsertCustomAccountTransactionMode.Create ? createResponse : updateResponse
}
