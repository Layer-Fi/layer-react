import type { OneOf } from '@internal-types/utility/oneOf'
import { post } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const EXCLUDE_EXTERNAL_ACCOUNT_TAG_KEY = '#exclude-external-account'

export type ExcludeAccountBodyStrict = OneOf<[
  { is_irrelevant: true },
  { is_duplicate: true },
]>

export const excludeExternalAccount = post<
  Record<string, unknown>,
  ExcludeAccountBodyStrict,
  { businessId: string, accountId: string }
>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/external-accounts/${accountId}/exclude`,
)

type ExcludeExternalAccountArg = {
  accountId: string
  body?: ExcludeAccountBodyStrict
}

export const useExcludeExternalAccount = createMutationHook({
  tags: [EXCLUDE_EXTERNAL_ACCOUNT_TAG_KEY],
  request: excludeExternalAccount,
  argToParams: ({ accountId }: ExcludeExternalAccountArg) => ({ accountId }),
  argToBody: ({ body }: ExcludeExternalAccountArg) => body,
})
