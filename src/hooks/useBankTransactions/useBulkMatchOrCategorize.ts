import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'
import { BulkMatchOrCategorizeDataSchema, BulkActionSchema } from '../../schemas/bankTransactions/bulkMatchOrCategorizeSchemas'
import { post } from '../../api/layer/authenticated_http'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { useAuth } from '../useAuth'
import { useSelectedIds } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useAllCategorySelections } from '../../providers/BankTransactionsCategoryStore/CategorySelectionStoreProvider'
import type { Key } from 'swr'
import type { SWRMutationResponse } from 'swr/mutation'
import type { SWRInfiniteKeyedMutator } from 'swr/infinite'
import { OptionActionType } from '../../types/categoryOption'
import { mapCategoryToOption } from '../../components/CategorySelect/CategorySelect'
import type { CategoryOption } from '../../types/categoryOption'
import { getCategorizePayload } from '../../utils/bankTransactions'
import { GetBankTransactionsReturn } from '../../api/layer/bankTransactions'
import { useLayerContext } from '../../contexts/LayerContext'

const BULK_MATCH_OR_CATEGORIZE_TAG = '#bulk-match-or-categorize'

const _BulkMatchOrCategorizeRequestSchema = Schema.Struct({
  transactions: Schema.Record({
    key: Schema.String,
    value: BulkActionSchema,
  }),
})

export type BulkMatchOrCategorizeParams = {
  businessId: string
  categorization_source?: 'API_DIRECT' | 'API_FROM_COMPONENT' | 'LAYER_BOOKKEEPING'
  match_source?: 'API_CONFIRM_MATCH_DIRECT' | 'API_CONFIRM_MATCH_FROM_COMPONENT' | 'LAYER_BOOKKEEPING_CONFIRM_MATCH'
}

type BulkMatchOrCategorizeRequest = typeof _BulkMatchOrCategorizeRequestSchema.Type

const _BulkMatchOrCategorizeResponseSchema = Schema.Struct({
  data: BulkMatchOrCategorizeDataSchema,
})

type BulkMatchOrCategorizeResponse = typeof _BulkMatchOrCategorizeResponseSchema.Type

const bulkMatchOrCategorize = post<
  BulkMatchOrCategorizeResponse,
  BulkMatchOrCategorizeRequest,
  BulkMatchOrCategorizeParams
>(
  ({ businessId, categorization_source, match_source }) => {
    const parameters = toDefinedSearchParameters({
      categorization_source,
      match_source,
    })

    return `/v1/businesses/${businessId}/bank-transactions/bulk-match-or-categorize${parameters ? `?${parameters}` : ''}`
  },
)

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
      tags: [BULK_MATCH_OR_CATEGORIZE_TAG],
    } as const
  }
}

type BulkMatchOrCategorizeSWRMutationResponse = SWRMutationResponse<BulkMatchOrCategorizeResponse, unknown, Key, BulkMatchOrCategorizeRequest>

class BulkMatchOrCategorizeSWRResponse {
  private swrResponse: BulkMatchOrCategorizeSWRMutationResponse

  constructor(swrResponse: BulkMatchOrCategorizeSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

type UseBulkMatchOrCategorizeProps = {
  mutateBankTransactions?: SWRInfiniteKeyedMutator<Array<GetBankTransactionsReturn>>
}

export const useBulkMatchOrCategorize = ({ mutateBankTransactions }: UseBulkMatchOrCategorizeProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { selectedIds } = useSelectedIds()
  const { selectedCategories }: { selectedCategories: Map<string, CategoryOption> } = useAllCategorySelections()

  const buildTransactionsPayload = useCallback((): BulkMatchOrCategorizeRequest => {
    const transactions: Record<string, typeof BulkActionSchema.Type> = {}

    for (const transactionId of selectedIds) {
      const categoryOption: CategoryOption | undefined = selectedCategories.get(transactionId)

      if (!categoryOption) {
        continue
      }

      if (categoryOption.payload.option_type === OptionActionType.MATCH) {
        transactions[transactionId] = {
          type: 'match',
          suggested_match_id: categoryOption.payload.id,
        }
      }
      else if (categoryOption.payload.option_type === OptionActionType.CATEGORY) {
        // Split Categorization
        if (categoryOption.payload.entries && categoryOption.payload.entries.length > 0) {
          transactions[transactionId] = {
            type: 'categorize',
            categorization: {
              type: 'Split',
              entries: categoryOption.payload.entries.map((entry) => {
                const categoryPayload = getCategorizePayload(mapCategoryToOption(entry.category))
                return {
                  amount: entry.amount ?? 0,
                  category: categoryPayload,
                }
              }),
            },
          }
        }
        else {
          // Single Categorization
          transactions[transactionId] = {
            type: 'categorize',
            categorization: {
              type: 'Category',
              category: getCategorizePayload(categoryOption),
            },
          }
        }
      }
    }

    return { transactions }
  }, [selectedIds, selectedCategories])

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg }: { arg: BulkMatchOrCategorizeRequest },
    ) => bulkMatchOrCategorize(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body: arg,
      },
    ),
    {
      revalidate: false,
    },
  )

  const mutationResponse = new BulkMatchOrCategorizeSWRResponse(rawMutationResponse)

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutateBankTransactions?.()

      return triggerResult
    },
    [
      originalTrigger,
      mutateBankTransactions,
    ],
  )

  const proxiedResponse = new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })

  return {
    ...proxiedResponse,
    buildTransactionsPayload,
  }
}
