import { Layer } from '../../api/layer'
import { ProfitAndLoss, ReportingBasis } from '../../types'
import { startOfMonth, endOfMonth, formatISO, sub } from 'date-fns'
import useSWR, { KeyedMutator } from 'swr'

type Props = {
  startDate: Date
  endDate: Date
  tagFilter?: {
    key: string
    values: string[]
  }
  reportingBasis?: ReportingBasis
  fetchMultipleMonths?: boolean
  businessId: string
  apiUrl: string
  auth: any
}

type FetchProfitAndLossData = (props?: Props) => {
  data: ProfitAndLoss[]
  isLoading: boolean
  isValidating: boolean
  error: any
  mutate: KeyedMutator<
    (() => Promise<{
      data?: ProfitAndLoss | undefined
      error?: unknown
    }>)[]
  >
}

const fetchData = (
  urls: string[],
  {
    startDate,
    endDate,
    tagFilter,
    reportingBasis,
    businessId,
    auth,
    apiUrl,
  }: Props,
) =>
  Promise.all(
    urls.map((url: string, idx: number) => {
      const startDateWithOffset = startOfMonth(sub(startDate, { months: idx }))
      const endDateWithOffset = endOfMonth(sub(endDate, { months: idx }))

      return Layer.getProfitAndLoss(apiUrl, auth?.access_token, {
        params: {
          businessId,
          startDate: formatISO(startDateWithOffset),
          endDate: formatISO(endDateWithOffset),
          tagKey: tagFilter?.key,
          tagValues: tagFilter?.values?.join(','),
          reportingBasis,
        },
      })
    }),
  )

export const fetchProfitAndLossData: FetchProfitAndLossData = (
  {
    startDate,
    endDate,
    tagFilter,
    reportingBasis,
    fetchMultipleMonths = false,
    businessId,
    auth,
    apiUrl,
  }: Props = {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    businessId: '',
    auth: {},
    apiUrl: '',
  },
) => {
  const urls: string[] = []
  if (fetchMultipleMonths) {
    for (let i = 11; i > 0; i--) {
      const startDateWithOffset = startOfMonth(sub(startDate, { months: i }))
      const endDateWithOffset = endOfMonth(sub(endDate, { months: i }))

      urls.push(
        `profit-and-loss-${businessId}-${startDateWithOffset.valueOf()}-${endDateWithOffset.valueOf()}-${tagFilter?.key}-${tagFilter?.values?.join(
          ',',
        )}-${reportingBasis}`,
      )
    }
  }

  urls.push(
    `profit-and-loss-${businessId}-${startDate.valueOf()}-${endDate.valueOf()}-${tagFilter?.key}-${tagFilter?.values?.join(
      ',',
    )}-${reportingBasis}`,
  )

  const {
    data: rawData,
    isLoading,
    isValidating,
    error: rawError,
    mutate,
  } = useSWR(businessId && auth?.access_token && urls, (urls: string[]) =>
    fetchData(urls, {
      startDate,
      endDate,
      tagFilter,
      reportingBasis,
      businessId,
      apiUrl,
      auth,
    }),
  )

  let fetchedData: ProfitAndLoss[] = []

  if (rawData) {
    rawData.map(item =>
      item().then(res => res.data && fetchedData.push(res.data)),
    )
  }

  return {
    data: fetchedData,
    isLoading,
    isValidating,
    error: rawError,
    mutate,
  }
}
