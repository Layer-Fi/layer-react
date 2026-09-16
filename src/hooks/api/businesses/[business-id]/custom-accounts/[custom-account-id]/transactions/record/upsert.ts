import { createUpsertHook } from '@hooks/utils/swr/createUpsertHook'
import { usePatchRecordCustomAccountTransaction } from '@api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/[transaction-id]/record/patch'
import { usePostRecordCustomAccountTransaction } from '@api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/post'

export const useUpsertCustomAccountTransaction = createUpsertHook({
  useCreate: usePostRecordCustomAccountTransaction,
  useUpdate: usePatchRecordCustomAccountTransaction,
  toCreateOptions: () => undefined,
  toUpdateOptions: (props: { transactionId: string }) => ({ transactionId: props.transactionId }),
})
