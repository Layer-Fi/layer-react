import { useMemo, useState } from 'react'
import { BILLS_MOCK_PAID, BILLS_MOCK_UNPAID } from './useBillsMOCK'
import { Bill } from '../types/bills'
import { DateRange } from '../types'
import { endOfMonth, startOfMonth, sub } from 'date-fns'
import { Vendor } from '../types/vendors'

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

  /**
   * @TODO Uncomment when API is ready
   */
  // const queryKey =
  //   businessId
  //   && auth?.access_token
  //   && `bills-${businessId}-`
  // @TODO - add dates from date picker
  // `bills-${businessId}-${startDate?.valueOf()}-${endDate?.valueOf()}`

  // const { data: rawData, isLoading, isValidating, error, mutate } = useSWR(
  //   queryKey,
  //   Layer.getBills(apiUrl, auth?.access_token, {
  //     params: {
  //       businessId,
  //       // startDate:
  //       //   withDates && startDate ? formatISO(startDate.valueOf()) : undefined,
  //       // endDate:
  //       //   withDates && endDate ? formatISO(endDate.valueOf()) : undefined,
  //     },
  //   }),
  // )

  const data = useMemo(() => {
    const collection = status === 'PAID' ? BILLS_MOCK_PAID : BILLS_MOCK_UNPAID
    if (vendor) {
      return collection.filter(bill => bill.vendor?.id === vendor.id)
    }

    return collection
  }, [status, vendor])

  return {
    data,
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
