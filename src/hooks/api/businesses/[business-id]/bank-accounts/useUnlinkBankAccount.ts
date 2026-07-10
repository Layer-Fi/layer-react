import { del } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UNLINK_BANK_ACCOUNT_TAG_KEY = '#unlink-bank-account'

const unlinkBankAccount = del<
  Record<string, unknown>,
  Record<string, unknown>,
  {
    businessId: string
    bankAccountId: string
  }
>(
  ({ businessId, bankAccountId }) =>
    `/v1/businesses/${businessId}/bank-accounts/${bankAccountId}`,
)

export const useUnlinkBankAccount = createMutationHook({
  tags: [UNLINK_BANK_ACCOUNT_TAG_KEY],
  request: unlinkBankAccount,
  argToParams: (bankAccountId: string) => ({ bankAccountId }),
  argToBody: () => undefined,
})
