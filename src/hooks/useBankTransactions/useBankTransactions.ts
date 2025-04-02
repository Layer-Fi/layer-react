import useSWRInfinite from 'swr/infinite'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { getBankTransactions, type GetBankTransactionsReturn } from '../../api/layer/bankTransactions'

type UseBankTransactionsOptions = {
  categorized?: boolean
  direction?: 'INFLOW' | 'OUTFLOW'
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
      direction,
      startDate,
      endDate,
      tagFilterQueryString,
    }
  }
}

export function useBankTransactions({
  categorized,
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
        direction,
        startDate,
        endDate,
        tagFilterQueryString,
      },
    ),
    ({ accessToken, apiUrl, businessId, cursor, startDate, endDate, tagFilterQueryString }) => {
      return getBankTransactions(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            cursor,
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
