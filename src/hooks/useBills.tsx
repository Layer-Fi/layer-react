import { useState } from 'react'
import { useLayerContext } from '../contexts/LayerContext'
import { useEnvironment } from '../providers/Environment/EnvironmentInputProvider'
import { useAuth } from './useAuth'
import { Layer } from '../api/layer'
import useSWR from 'swr'
import { BILLS_MOCK_PAID, BILLS_MOCK_UNPAID } from './useBillsMOCK'
import { Bill, BillStatusFilter } from '../types/bills'

type UseBills = () => {
  data: Bill[]
  billInDetails?: Bill
  setBillInDetails: (bill: Bill | undefined) => void
  closeBillDetails: () => void
  status: BillStatusFilter
  setStatus: (status: BillStatusFilter) => void
}

export const useBills: UseBills = () => {
  const [status, setStatus] = useState<BillStatusFilter>('UNPAID')
  const [billInDetails, setBillInDetails] = useState<Bill | undefined>()

  const closeBillDetails = () => {
    setBillInDetails(undefined)
  }

  /**
   * @TODO move vendors to another hook and context(?)
   * Uncomment both when API is ready
   */
  // const {
  //   businessId,
  //   touch,
  //   read,
  //   syncTimestamps,
  //   hasBeenTouched,
  // } = useLayerContext()
  // const { apiUrl } = useEnvironment()
  // const { data: auth } = useAuth()

  // const queryKey =
  //   businessId
  //   && auth?.access_token
  //   && `vendors-${businessId}`

  // const { data: rawData, isLoading, isValidating, error, mutate } = useSWR(
  //   queryKey,
  //   Layer.getVendors(apiUrl, auth?.access_token, {
  //     params: { businessId },
  //   }),
  // )

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

  const data = status === 'PAID' ? BILLS_MOCK_PAID : BILLS_MOCK_UNPAID

  return {
    data,
    billInDetails,
    setBillInDetails,
    closeBillDetails,
    status,
    setStatus,
  }
}
