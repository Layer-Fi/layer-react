import { createUpsertHook } from '@hooks/utils/swr/createUpsertHook'
import { usePutLedgerAccount } from '@api/businesses/[business-id]/ledger/accounts/[account-id]/put'
import { usePostLedgerAccount } from '@api/businesses/[business-id]/ledger/accounts/post'

export const useUpsertLedgerAccount = createUpsertHook({
  useCreate: usePostLedgerAccount,
  useUpdate: usePutLedgerAccount,
  toCreateOptions: () => undefined,
  toUpdateOptions: (props: { accountId: string }) => ({ accountId: props.accountId }),
})
