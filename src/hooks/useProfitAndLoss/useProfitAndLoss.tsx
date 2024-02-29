import { useState } from 'react'
import { Layer } from '../../api/layer'
import { ProfitAndLoss, DateRange, ReportingBasis } from '../../types'
import { useLayerContext } from '../useLayerContext'
import { startOfMonth, endOfMonth, formatISO } from 'date-fns'
import useSWR from 'swr'

type Props = {
  startDate?: Date
  endDate?: Date
  tagFilter?: {
    key: string
    values: string[]
  }
  reportingBasis?: ReportingBasis
  businessId?: string
}

type UseProfitAndLoss = (props?: Props) => {
  data: ProfitAndLoss | undefined
  isLoading: boolean
  error: unknown
  dateRange: DateRange
  changeDateRange: (dateRange: Partial<DateRange>) => void
}

export const useProfitAndLoss: UseProfitAndLoss = (
  {
    startDate: initialStartDate,
    endDate: initialEndDate,
    tagFilter,
    reportingBasis,
    businessId: overrideBusinessId,
  }: Props = {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
) => {
  const { auth, businessId, apiUrl } = useLayerContext()
  const [startDate, setStartDate] = useState(
    initialStartDate || startOfMonth(Date.now()),
  )
  const [endDate, setEndDate] = useState(
    initialEndDate || endOfMonth(Date.now()),
  )

  const {
    data: rawData,
    isLoading,
    error: rawError,
  } = useSWR(
    businessId &&
      startDate &&
      endDate &&
      auth?.access_token &&
      `profit-and-loss-${
        overrideBusinessId || businessId
      }-${startDate.valueOf()}-${endDate.valueOf()}-${tagFilter?.key}-${tagFilter?.values?.join(
        ',',
      )}-${reportingBasis}`,
    Layer.getProfitAndLoss(apiUrl, auth?.access_token, {
      params: {
        businessId,
        startDate: formatISO(startDate),
        endDate: formatISO(endDate),
        tagKey: tagFilter?.key,
        tagValues: tagFilter?.values?.join(','),
        reportingBasis,
      },
    }),
  )
  const { data, error } = rawData || {}

  const changeDateRange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }: Partial<DateRange>) => {
    newStartDate && setStartDate(newStartDate)
    newEndDate && setEndDate(newEndDate)
  }

  return {
    data,
    isLoading,
    error: error || rawError,
    dateRange: { startDate, endDate },
    changeDateRange,
  }
}
