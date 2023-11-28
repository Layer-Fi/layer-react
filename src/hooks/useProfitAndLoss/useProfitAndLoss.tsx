import { useState } from 'react'
import { Layer } from '../../api/layer'
import { ProfitAndLoss, DateRange } from '../../types'
import { useLayerContext } from '../useLayerContext'
import { startOfMonth, endOfMonth, formatISO } from 'date-fns'
import useSWR from 'swr'

type UseProfitAndLoss = {
  data: ProfitAndLoss | undefined
  isLoading: boolean
  error: unknown
  dateRange: DateRange
  changeDateRange: (dateRange: Partial<DateRange>) => void
}

type Props = DateRange

export const useProfitAndLoss = (
  { startDate: initialStartDate, endDate: initialEndDate }: Props = {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
): UseProfitAndLoss => {
  const { auth, businessId } = useLayerContext()
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
      `profit-and-loss-${businessId}-${startDate.valueOf()}-${endDate.valueOf()}`,
    Layer.getProfitAndLoss(auth?.access_token, {
      params: {
        businessId,
        startDate: formatISO(startDate),
        endDate: formatISO(endDate),
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
