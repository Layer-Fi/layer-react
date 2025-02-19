import { useMemo, useState } from 'react'
import { Bill } from '../types/bills'
import { DateRange, Metadata } from '../types'
import { endOfMonth, startOfMonth, sub } from 'date-fns'
import { Vendor } from '../types/vendors'
import { useLayerContext } from '../contexts/LayerContext'
import { useAuth } from './useAuth'
import useSWRInfinite from 'swr/infinite'
import { useEnvironment } from '../providers/Environment/EnvironmentInputProvider'
import { Layer } from '../api/layer'
import { GetBillsReturn } from '../api/layer/bills'

export type BillStatusFilter = 'PAID' | 'UNPAID'

const PAGE_SIZE = 2

type UseBills = () => {
  data: Bill[]
  paginatedData: Bill[]
  currentPage: number
  setCurrentPage: (page: number) => void
  pageSize: number
  metadata?: Metadata
  billInDetails?: Bill
  setBillInDetails: (bill: Bill | undefined) => void
  closeBillDetails: () => void
  status: BillStatusFilter
  setStatus: (status: BillStatusFilter) => void
  dateRange: DateRange
  setDateRange: (dateRange: DateRange) => void
  vendor: Vendor | null
  setVendor: (vendor: Vendor | null) => void
  fetchMore: () => void
  hasMore: boolean
  isLoading: boolean
  isValidating: boolean
  error?: Error
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
  const [currentPage, setCurrentPage] = useState(1)

  const closeBillDetails = () => {
    setBillInDetails(undefined)
  }

  // const { data: rawData, isLoading, isValidating, error, mutate } = useSWR(
  //   queryKey,
  //   Layer.getBills(apiUrl, auth?.access_token, {
  //     params: {
  //       businessId,
  //       startDate: formatISO(dateRange.startDate.valueOf()),
  //       endDate: formatISO(dateRange.endDate.valueOf()),
  //       status,
  //       vendorId: vendor?.id,
  //     },
  //   }),
  // )

  const getKey = (index: number, prevData: GetBillsReturn) => {
    console.log('prevData', prevData)
    if (!auth?.access_token) {
      return [false, undefined]
    }

    if (index === 0) {
      return [
        businessId
        && auth?.access_token
        && `bills-${businessId}-${dateRange.startDate.valueOf()}-${dateRange.endDate.valueOf()}-${status}-${vendor?.id}`,
        undefined,
      ]
    }

    return [
      businessId
      && auth?.access_token
      && `bills-${businessId}-${dateRange.startDate.valueOf()}-${dateRange.endDate.valueOf()}-${status}-${vendor?.id}-${
        prevData?.meta?.pagination?.cursor
      }`,
      prevData?.meta?.pagination?.cursor?.toString(),
    ]
  }

  const {
    data: rawResponseData,
    isLoading,
    isValidating,
    error,
    mutate,
    size,
    setSize,
  } = useSWRInfinite<GetBillsReturn, Error>( // @TODO - double-check if Error is correct
    getKey,
    async ([_query, nextCursor]) => {
      console.log('nextCursor', nextCursor)
      if (auth?.access_token) {
        return Layer.getBills(apiUrl, auth?.access_token, {
          params: {
            businessId,
            cursor: nextCursor as string ?? '',
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString(),
            status,
            vendorId: vendor?.id,
          },
        }).call(false)
      }

      return {}
    },
    {
      initialSize: 1,
      revalidateFirstPage: false,
    },
  )

  const data: Bill[] | undefined = useMemo(() => {
    if (rawResponseData && rawResponseData.length > 0) {
      return rawResponseData
        ?.map(x => x?.data)
        .flat()
        .filter(x => !!x) as unknown as Bill[]
    }

    return undefined
  }, [rawResponseData])

  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE
    const lastPageIndex = firstPageIndex + PAGE_SIZE
    return data?.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, data])

  console.log('data', data, paginatedData)

  const lastMetadata = useMemo(() => {
    if (rawResponseData && rawResponseData.length > 0) {
      return rawResponseData[rawResponseData.length - 1].meta
    }

    return undefined
  }, [rawResponseData])

  const hasMore = useMemo(() => {
    if (rawResponseData && rawResponseData.length > 0) {
      const lastElement = rawResponseData[rawResponseData.length - 1]
      return Boolean(
        lastElement.meta?.pagination?.cursor
        && lastElement.meta?.pagination?.has_more,
      )
    }

    return false
  }, [rawResponseData])

  const fetchMore = () => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }

  // const data = useMemo(() => {
  //   const collection = status === 'PAID' ? BILLS_MOCK_PAID : BILLS_MOCK_UNPAID
  //   if (vendor) {
  //     return collection.filter(bill => bill.vendor?.id === vendor.id)
  //   }

  //   return collection
  // }, [status, vendor])

  return {
    data: data ?? [],
    paginatedData: paginatedData ?? [],
    currentPage,
    setCurrentPage,
    pageSize: PAGE_SIZE,
    metadata: lastMetadata,
    billInDetails,
    setBillInDetails,
    closeBillDetails,
    status,
    setStatus,
    dateRange,
    setDateRange,
    vendor,
    setVendor,
    fetchMore,
    hasMore,
    isLoading,
    isValidating,
    error,
  }
}
