import { type PcMsoOwner } from '@schemas/features/bankAccounts/bankAccount'
import { put } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBankAccountsGlobalCacheActions } from '@api/businesses/[business-id]/bank-accounts/get'

export const useAssignPcMsoOwner = createMutationHook({
  tags: ['#assign-pc-mso-owner'],
  keyParams: ['bankAccountId'],
  request: put<Record<string, unknown>, { owner: PcMsoOwner }, { businessId: string, bankAccountId: string }>(
    ({ businessId, bankAccountId }) => `/v1/businesses/${businessId}/bank-accounts/${bankAccountId}/pc-mso-owner`,
  ),
  useOnTriggerSuccess: () => {
    const { invalidate } = useBankAccountsGlobalCacheActions()
    return async () => {
      await invalidate()
    }
  },
})
