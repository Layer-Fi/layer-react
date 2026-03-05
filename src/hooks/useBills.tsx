import { useMemo, useState } from 'react'
import { endOfMonth, startOfMonth, sub } from 'date-fns'
import useSWRInfinite from 'swr/infinite'

import { type Metadata } from '@internal-types/api'
import { type Bill } from '@internal-types/bills'
import { type DateRange } from '@internal-types/general'
import { type Vendor } from '@internal-types/vendors'
import { type APIError } from '@models/APIError'
import { get } from '@utils/api/authenticatedHttp'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type GetBillsReturn = {
  data?: Bill[]
  meta?: Metadata
  error?: unknown
}

interface GetBillsParams extends Record<string, string | undefined> {
  businessId: string
  cursor?: string
  startDate?: string
  endDate?: string
  status?: string
  vendorId?: string
}

export const getBills = get<GetBillsReturn, GetBillsParams>(
  ({ businessId, startDate, endDate, status, vendorId, cursor, limit = 15 }) => `/v1/businesses/${businessId}/bills?${
    vendorId ? `&vendor_id=${vendorId}` : ''
  }${
    cursor ? `&cursor=${cursor}` : ''
  }${
    startDate ? `&received_at_start=${startDate}` : ''
  }${
    endDate ? `&received_at_end=${endDate}` : ''
  }${
    status ? `&status=${status}` : ''
  }&limit=${limit}&sort_by=received_at&sort_order=DESC`,
)

export type BillStatusFilter = 'PAID' | 'UNPAID'

const PAGE_SIZE = 20

type UseBills = () => {
  data: Bill[]
  paginatedData: Bill[]
  currentPage: number
  setCurrentPage: (page: number) => void
  pageSize: number
  metadata?: Metadata
  billInDetails?: Bill
  openBillDetails: (bill?: Bill) => void
  showBillInDetails: boolean
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
  refetch: () => void
}

export const useBills: UseBills = () => {
  const { businessId } = useLayerContext()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const [status, setStatus] = useState<BillStatusFilter>('UNPAID')
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [billInDetails, setBillInDetails] = useState<Bill | undefined>()
  const [showBillInDetails, setShowBillInDetails] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: sub(startOfMonth(new Date()), { years: 1 }),
    endDate: endOfMonth(new Date()),
  })
  const [currentPage, setCurrentPage] = useState(1)

  const openBillDetails = (bill?: Bill) => {
    setBillInDetails(bill)
    setShowBillInDetails(true)
  }

  const closeBillDetails = () => {
    setBillInDetails(undefined)
    setShowBillInDetails(false)
  }

  const getKey = (index: number, prevData: GetBillsReturn) => {
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
    size,
    setSize,
    mutate,
  } = useSWRInfinite<GetBillsReturn, APIError>(
    getKey,
    async ([_query, nextCursor]) => {
      if (auth?.access_token) {
        return getBills(apiUrl, auth?.access_token, {
          params: {
            businessId,
            cursor: nextCursor as string ?? '',
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString(),
            status: status === 'UNPAID' ? 'RECEIVED,PARTIALLY_PAID' : 'PAID',
            vendorId: status === 'UNPAID' ? vendor?.id : undefined,
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

  const refetch = () => {
    void mutate()
  }

  return {
    data: data ?? [],
    paginatedData: paginatedData ?? [],
    currentPage,
    setCurrentPage,
    pageSize: PAGE_SIZE,
    metadata: lastMetadata,
    billInDetails,
    openBillDetails,
    closeBillDetails,
    showBillInDetails,
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
    refetch,
  }
}
