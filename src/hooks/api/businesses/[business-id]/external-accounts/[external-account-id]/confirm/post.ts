import type { OneOf } from '@internal-types/utility/oneOf'
import { post } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CONFIRM_EXTERNAL_ACCOUNT_TAG_KEY = '#confirm-external-account'

export type ConfirmAccountBodyStrict = OneOf<[
  { is_unique: true },
  { is_relevant: true },
]>

export const confirmExternalAccount = post<
  Record<string, unknown>,
  ConfirmAccountBodyStrict,
  { businessId: string, accountId: string }
>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/external-accounts/${accountId}/confirm`,
)

type ConfirmExternalAccountArg = {
  accountId: string
  body?: ConfirmAccountBodyStrict
}

export const useConfirmExternalAccount = createMutationHook({
  tags: [CONFIRM_EXTERNAL_ACCOUNT_TAG_KEY],
  request: confirmExternalAccount,
  argToParams: ({ accountId }: ConfirmExternalAccountArg) => ({ accountId }),
  argToBody: ({ body }: ConfirmExternalAccountArg) => body,
})
