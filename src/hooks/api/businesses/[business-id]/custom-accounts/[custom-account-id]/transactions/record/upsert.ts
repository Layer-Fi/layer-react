import { usePatchRecordCustomAccountTransaction } from '@api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/[transaction-id]/record/patch'
import { usePostRecordCustomAccountTransaction } from '@api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/post'

export enum UpsertCustomAccountTransactionMode {
  Create = 'Create',
  Update = 'Update',
}

type UseUpsertCustomAccountTransactionProps =
  | { mode: UpsertCustomAccountTransactionMode.Create }
  | { mode: UpsertCustomAccountTransactionMode.Update, transactionId: string }

export const useUpsertCustomAccountTransaction = (props: UseUpsertCustomAccountTransactionProps) => {
  const transactionId = props.mode === UpsertCustomAccountTransactionMode.Update ? props.transactionId : undefined

  const createResponse = usePostRecordCustomAccountTransaction()
  const updateResponse = usePatchRecordCustomAccountTransaction({ transactionId: transactionId ?? '' })

  return props.mode === UpsertCustomAccountTransactionMode.Create ? createResponse : updateResponse
}
