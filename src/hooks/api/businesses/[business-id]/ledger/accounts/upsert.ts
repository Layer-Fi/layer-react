import { usePutLedgerAccount } from '@api/businesses/[business-id]/ledger/accounts/[account-id]/put'
import { usePostLedgerAccount } from '@api/businesses/[business-id]/ledger/accounts/post'

export enum UpsertLedgerAccountMode {
  Create = 'Create',
  Update = 'Update',
}

type UseUpsertLedgerAccountProps =
  | { mode: UpsertLedgerAccountMode.Create }
  | { mode: UpsertLedgerAccountMode.Update, accountId: string }

export const useUpsertLedgerAccount = (props: UseUpsertLedgerAccountProps) => {
  const { mode } = props
  const accountId = mode === UpsertLedgerAccountMode.Update ? props.accountId : undefined

  const createResponse = usePostLedgerAccount()
  const updateResponse = usePutLedgerAccount({
    accountId: accountId ?? '',
  })

  return mode === UpsertLedgerAccountMode.Create ? createResponse : updateResponse
}
