import { useState } from 'react'
import { Layer } from '../../api/layer'
import { ProfitAndLoss } from '../../types'
import { useLayerContext } from '../useLayerContext'
import { startOfMonth, endOfMonth, formatISO } from 'date-fns'
import useSWR from 'swr'

type DateRange = {
  startDate: string
  endDate: string
}

type UseProfitAndLoss = {
  data: ProfitAndLoss | undefined
  isLoading: boolean
  error: unknown
  changeDateRange: (dateRange: Partial<DateRange>) => void
}

type Props = {
  startDate?: string
  endDate?: string
}

export const useProfitAndLoss = ({
  startDate: initialStartDate,
  endDate: initialEndDate,
}: Props = {}): UseProfitAndLoss => {
  const { auth, businessId } = useLayerContext()
  const [startDate, setStartDate] = useState(
    initialStartDate || formatISO(startOfMonth(Date.now())),
  )
  const [endDate, setEndDate] = useState(
    initialEndDate || formatISO(endOfMonth(Date.now())),
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
      `profit-and-loss-${businessId}-${startDate}-${endDate}`,
    Layer.getProfitAndLoss(auth?.access_token, {
      params: { businessId, startDate, endDate },
    }),
  )
  const { data, error } = rawData || {}

  const changeDateRange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }: {
    startDate?: string
    endDate?: string
  }) => {
    newStartDate && setStartDate(newStartDate)
    newEndDate && setEndDate(newEndDate)
  }

  return { data, isLoading, error: error || rawError, changeDateRange }
}
