import { useLayerContext } from '../../contexts/LayerContext'
import { withSWRKeyTags } from '../../utils/swr/withSWRKeyTags'
import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'
import { post } from '../../api/layer/authenticated_http'
import { CreateCategorizationRuleSchema, CategorizationRuleSchema } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { BANK_ACCOUNTS_TAG_KEY } from '../bookkeeping/useBankAccounts'
import { useAuth } from '../useAuth'
import { EXTERNAL_ACCOUNTS_TAG_KEY } from '../useLinkedAccounts/useListExternalAccounts'
import { usePnlDetailLinesInvalidator } from '../useProfitAndLoss/useProfitAndLossDetailLines'
import { useProfitAndLossGlobalInvalidator } from '../useProfitAndLoss/useProfitAndLossGlobalInvalidator'
import { Schema } from 'effect/index'
import { useBankTransactionsGlobalCacheActions } from '../useBankTransactions/useBankTransactions'

const CREATE_CATEGORIZATION_RULE_TAG = '#create-categorization-rule'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [CREATE_CATEGORIZATION_RULE_TAG],
    }
  }
}

const CreateCategorizationRuleReturnSchema = Schema.Struct({
  data: CategorizationRuleSchema,
})

type CreateCategorizationRuleReturn = typeof CreateCategorizationRuleReturnSchema.Type
type CreateCategorizationRuleBody = typeof CreateCategorizationRuleSchema.Encoded

const createCategorizationRule = post<CreateCategorizationRuleReturn, CreateCategorizationRuleBody>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/categorization-rules`,
)

export function useCreateCategorizationRule() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()

  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { invalidatePnlDetailLines } = usePnlDetailLinesInvalidator()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: { ...body } }: { arg: CreateCategorizationRuleBody },
    ) => createCategorizationRule(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
        },
        body,
      },
    ).then(Schema.decodeUnknownPromise(CreateCategorizationRuleReturnSchema)),
    {
      revalidate: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        tags => tags.includes(BANK_ACCOUNTS_TAG_KEY)
          || tags.includes(EXTERNAL_ACCOUNTS_TAG_KEY),
      ))
      /**
       * SWR does not expose infinite queries through the matcher
       *
       * @see https://github.com/vercel/swr/blob/main/src/_internal/utils/mutate.ts#L78
       */
      void forceReloadBankTransactions()
      void invalidatePnlDetailLines()

      void debouncedInvalidateProfitAndLoss()

      return triggerResult
    },
    [originalTrigger, mutate, forceReloadBankTransactions, invalidatePnlDetailLines, debouncedInvalidateProfitAndLoss],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
