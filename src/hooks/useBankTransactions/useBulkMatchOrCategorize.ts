import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'
import { BulkActionSchema } from '../../schemas/bankTransactions/bulkMatchOrCategorizeSchemas'
import { ClassificationSchema } from '../../schemas/categorization'
import { post } from '../../api/layer/authenticated_http'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { useAuth } from '../useAuth'
import { useSelectedIds } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useGetAllBankTransactionsCategories } from '../../providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import type { SWRInfiniteKeyedMutator } from 'swr/infinite'
import { OptionActionType } from '../../types/categoryOption'
import { mapCategoryToOption } from '../../components/CategorySelect/CategorySelect'
import type { CategoryOption } from '../../types/categoryOption'
import { getCategorizePayload } from '../../utils/bankTransactions'
import type { GetBankTransactionsReturn } from '../../api/layer/bankTransactions'
import { useLayerContext } from '../../contexts/LayerContext'

const BULK_MATCH_OR_CATEGORIZE_TAG = '#bulk-match-or-categorize'

const _BulkMatchOrCategorizeRequestSchema = Schema.Struct({
  transactions: Schema.Record({
    key: Schema.UUID,
    value: BulkActionSchema,
  }),
})

export type BulkMatchOrCategorizeParams = {
  businessId: string
  categorization_source?: 'API_DIRECT' | 'API_FROM_COMPONENT' | 'LAYER_BOOKKEEPING'
  match_source?: 'API_CONFIRM_MATCH_DIRECT' | 'API_CONFIRM_MATCH_FROM_COMPONENT' | 'LAYER_BOOKKEEPING_CONFIRM_MATCH'
}

type BulkMatchOrCategorizeRequest = typeof _BulkMatchOrCategorizeRequestSchema.Type
type BulkMatchOrCategorizeRequestEncoded = typeof _BulkMatchOrCategorizeRequestSchema.Encoded

const bulkMatchOrCategorize = post<
  Record<string, unknown>,
  BulkMatchOrCategorizeRequestEncoded,
  BulkMatchOrCategorizeParams
>(
  ({ businessId, categorization_source, match_source }) => {
    const parameters = toDefinedSearchParameters({
      categorization_source,
      match_source,
    })

    return `/v1/businesses/${businessId}/bank-transactions/bulk-match-or-categorize${parameters}`
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

type UseBulkMatchOrCategorizeProps = {
  mutateBankTransactions?: SWRInfiniteKeyedMutator<Array<GetBankTransactionsReturn>>
}

export const useBulkMatchOrCategorize = ({ mutateBankTransactions }: UseBulkMatchOrCategorizeProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { selectedIds } = useSelectedIds()
  const { transactionCategories } = useGetAllBankTransactionsCategories()

  const buildTransactionsPayload = useCallback((): BulkMatchOrCategorizeRequest => {
    const transactions: Record<string, typeof BulkActionSchema.Type> = {}

    for (const transactionId of selectedIds) {
      const transactionCategory: CategoryOption | undefined = transactionCategories.get(transactionId)

      if (!transactionCategory) {
        continue
      }

      if (transactionCategory.payload.option_type === OptionActionType.MATCH) {
        transactions[transactionId] = {
          type: 'match',
          suggestedMatchId: transactionCategory.payload.id,
        }
      }
      else if (transactionCategory.payload.option_type === OptionActionType.CATEGORY) {
        // Split Categorization
        if (transactionCategory.payload.entries && transactionCategory.payload.entries.length > 0) {
          transactions[transactionId] = {
            type: 'categorize',
            categorization: {
              type: 'Split',
              entries: transactionCategory.payload.entries.map((entry) => {
                const categoryPayload = getCategorizePayload(mapCategoryToOption(entry.category))
                return {
                  amount: entry.amount ?? 0,
                  category: Schema.decodeSync(ClassificationSchema)(categoryPayload),
                }
              }),
            },
          }
        }
        else {
          // Single Categorization
          const categoryPayload = getCategorizePayload(transactionCategory)
          transactions[transactionId] = {
            type: 'categorize',
            categorization: {
              type: 'Category',
              category: Schema.decodeSync(ClassificationSchema)(categoryPayload),
            },
          }
        }
      }
    }

    return { transactions }
  }, [selectedIds, transactionCategories])

  const mutationResponse = useSWRMutation(
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
        body: Schema.encodeSync(_BulkMatchOrCategorizeRequestSchema)(arg),
      },
    ).then(({ data }) => data),
    {
      revalidate: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

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
