import { pipe, Schema } from 'effect'
import useSWR from 'swr'

import { CustomAccountSchema } from '@schemas/customAccounts'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const CUSTOM_ACCOUNTS_TAG_KEY = '#custom-accounts'

const GetCustomAccountsResponseSchema = Schema.Struct({
  data: Schema.Struct({
    customAccounts: pipe(
      Schema.propertySignature(Schema.Array(CustomAccountSchema)),
      Schema.fromKey('custom_accounts'),
    ),
  }),
})

type GetCustomAccountsResponseEncoded = typeof GetCustomAccountsResponseSchema.Encoded

const buildKey = createBuildKey<{ businessId: string, userCreated?: boolean }>([CUSTOM_ACCOUNTS_TAG_KEY])

const getCustomAccounts = get<
  GetCustomAccountsResponseEncoded,
  {
    businessId: string
    userCreated?: boolean
  }
>(({ businessId, userCreated }) => {
  const baseUrl = `/v1/businesses/${businessId}/custom-accounts`

  if (userCreated !== undefined) {
    return `${baseUrl}?user_created=${userCreated}`
  }
  return baseUrl
})

type useCustomAccountsParams = {
  userCreated?: boolean
}
export function useCustomAccounts({ userCreated }: useCustomAccountsParams = {}) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => withLocale(buildKey({
      ...data,
      businessId,
      userCreated,
    })),
    ({ accessToken, apiUrl, businessId, userCreated }) => getCustomAccounts(
      apiUrl,
      accessToken,
      {
        params: { businessId, userCreated },
      },
    )()
      .then(Schema.decodeUnknownPromise(GetCustomAccountsResponseSchema))
      .then(({ data }) => data.customAccounts),
  )
}
