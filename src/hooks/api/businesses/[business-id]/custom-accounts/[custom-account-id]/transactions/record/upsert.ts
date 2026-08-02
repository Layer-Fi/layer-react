import { usePatchRecordCustomAccountTransaction } from '@api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/[transaction-id]/record/patch'
import { usePostRecordCustomAccountTransaction } from '@api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/post'
import { createUpsertHook } from '@hooks/utils/swr/createUpsertHook'

export const useUpsertCustomAccountTransaction = createUpsertHook({
  useCreate: usePostRecordCustomAccountTransaction,
  useUpdate: usePatchRecordCustomAccountTransaction,
  toCreateOptions: () => undefined,
  toUpdateOptions: (props: { transactionId: string }) => ({ transactionId: props.transactionId }),
})
