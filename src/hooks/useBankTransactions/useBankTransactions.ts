import useSWRInfinite from 'swr/infinite'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { getBankTransactions, type GetBankTransactionsReturn } from '../../api/layer/bankTransactions'

type UseBankTransactionsOptions = {
  categorized?: boolean
  direction?: 'INFLOW' | 'OUTFLOW'
  descriptionFilter?: string
  startDate?: Date
  endDate?: Date
  tagFilterQueryString?: string
}

function keyLoader(
  previousPageData: GetBankTransactionsReturn | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    categorized,
    descriptionFilter,
    direction,
    startDate,
    endDate,
    tagFilterQueryString,
  }: UseBankTransactionsOptions & {
    access_token?: string
    apiUrl?: string
    businessId: string
  },
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      categorized,
      cursor: previousPageData ? previousPageData.meta.pagination.cursor : undefined,
      descriptionFilter,
      direction,
      startDate,
      endDate,
      tagFilterQueryString,
      tags: ['#bank-transactions'],
    } as const
  }
}

export function useBankTransactions({
  categorized,
  descriptionFilter,
  direction,
  startDate,
  endDate,
  tagFilterQueryString,
}: UseBankTransactionsOptions) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  return useSWRInfinite(
    (_index, previousPageData: GetBankTransactionsReturn | null) => keyLoader(
      previousPageData,
      {
        ...data,
        businessId,
        categorized,
        descriptionFilter,
        direction,
        startDate,
        endDate,
        tagFilterQueryString,
      },
    ),
    ({
      accessToken,
      apiUrl,
      businessId,
      categorized,
      cursor,
      direction,
      descriptionFilter,
      startDate,
      endDate,
      tagFilterQueryString,
    }) => {
      return getBankTransactions(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            categorized,
            cursor,
            descriptionFilter,
            direction,
            startDate,
            endDate,
            tagFilterQueryString,
          },
        },
      )()
    },
    {
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )
}
