import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { BankTransactionSchema } from '@schemas/features/bankTransactions/bankTransaction'
import { del } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBankTransactionTriggerSuccess } from '@api/businesses/[business-id]/bank-transactions/triggerSuccess'

const ARCHIVE_BANK_TRANSACTION_TAG = '#archive-bank-transaction'

const ArchiveBankTransactionResponseSchema = UnwrappedDataResponseSchema(BankTransactionSchema)

const archiveBankTransaction = del<
  typeof ArchiveBankTransactionResponseSchema.Encoded,
  Record<string, never>,
  {
    businessId: string
    bankTransactionId: string
  }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}`,
)

export const useArchiveBankTransaction = createMutationHook({
  tags: [ARCHIVE_BANK_TRANSACTION_TAG],
  request: archiveBankTransaction,
  keyParams: ['bankTransactionId'],
  argToBody: (_arg: never) => undefined,
  schema: ArchiveBankTransactionResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBankTransactionTriggerSuccess,
})
