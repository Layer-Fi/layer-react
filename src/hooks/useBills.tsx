import { useState } from 'react'
import { Bill } from '../types/bills'
import { DateRange } from '../types'
import { endOfMonth, formatISO, startOfMonth, sub } from 'date-fns'
import { Vendor } from '../types/vendors'
import { useLayerContext } from '../contexts/LayerContext'
import { useAuth } from './useAuth'
import useSWR from 'swr'
import { useEnvironment } from '../providers/Environment/EnvironmentInputProvider'
import { Layer } from '../api/layer'

export type BillStatusFilter = 'PAID' | 'UNPAID'

type UseBills = () => {
  data: Bill[]
  billInDetails?: Bill
  setBillInDetails: (bill: Bill | undefined) => void
  closeBillDetails: () => void
  status: BillStatusFilter
  setStatus: (status: BillStatusFilter) => void
  dateRange: DateRange
  setDateRange: (dateRange: DateRange) => void
  vendor: Vendor | null
  setVendor: (vendor: Vendor | null) => void
}

export const useBills: UseBills = () => {
  const { businessId } = useLayerContext()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const [status, setStatus] = useState<BillStatusFilter>('UNPAID')
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [billInDetails, setBillInDetails] = useState<Bill | undefined>()
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: sub(startOfMonth(new Date()), { years: 1 }),
    endDate: endOfMonth(new Date()),
  })

  const closeBillDetails = () => {
    setBillInDetails(undefined)
  }

  const queryKey = businessId
    && auth?.access_token
    && `bills-${businessId}-${dateRange.startDate.valueOf()}-${dateRange.endDate.valueOf()}-${status}`

  const { data: rawData, isLoading, isValidating, error, mutate } = useSWR(
    queryKey,
    Layer.getBills(apiUrl, auth?.access_token, {
      params: {
        businessId,
        startDate: formatISO(dateRange.startDate.valueOf()),
        endDate: formatISO(dateRange.endDate.valueOf()),
        status,
      },
    }),
  )

  const data = rawData?.data

  // const data = useMemo(() => {
  //   const collection = status === 'PAID' ? BILLS_MOCK_PAID : BILLS_MOCK_UNPAID
  //   if (vendor) {
  //     return collection.filter(bill => bill.vendor?.id === vendor.id)
  //   }

  //   return collection
  // }, [status, vendor])

  return {
    data: data ?? [],
    billInDetails,
    setBillInDetails,
    closeBillDetails,
    status,
    setStatus,
    dateRange,
    setDateRange,
    vendor,
    setVendor,
  }
}
