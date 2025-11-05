import { View } from '../View/View'
import { InvoiceRoute, useInvoiceRouteState } from '../../providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { InvoiceDetail } from './InvoiceDetail/InvoiceDetail'
import { InvoiceOverview } from './InvoiceOverview/InvoiceOverview'
import { usePreloadCustomers } from '../../features/customers/api/useListCustomers'
import { usePreloadCategories } from '../../hooks/categories/useCategories'
import { CategoriesListMode } from '../../schemas/categorization'
import { usePreloadTagDimensionByKey } from '../../features/tags/api/useTagDimensionByKey'
import { INVOICE_MECE_TAG_DIMENSION } from './InvoiceForm/formUtils'
import type { Awaitable } from '../../types/utility/promises'
import { InvoicesProvider } from '../../contexts/InvoicesContext/InvoicesContext'
import { useGlobalDateRange, useGlobalDateRangeActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { useCallback } from 'react'
import { getLocalTimeZone, ZonedDateTime, fromDate } from '@internationalized/date'
import { UnifiedReport } from '../UnifiedReport/UnifiedReport'
import { GlobalMonthPicker } from '../GlobalMonthPicker/GlobalMonthPicker'

interface InvoicesStringOverrides {
  title?: string
}

export interface InvoicesProps {
  showTitle?: boolean
  stringOverrides?: InvoicesStringOverrides
  onSendInvoice?: (invoiceId: string) => Awaitable<void>
}

export const Invoices = ({ showTitle = true, stringOverrides, onSendInvoice }: InvoicesProps) => {
  usePreloadCustomers()
  usePreloadCategories({ mode: CategoriesListMode.Revenue })
  usePreloadTagDimensionByKey({ dimensionKey: INVOICE_MECE_TAG_DIMENSION })
  const { startDate } = useGlobalDateRange({ displayMode: 'monthPicker' })
  const { setMonth } = useGlobalDateRangeActions()

  const passedDate = fromDate(startDate, getLocalTimeZone())
  const setReceivedDate = useCallback((val: ZonedDateTime | null) => {
    if (val == null) return
    setMonth({ startDate: val.toDate() })
  }, [setMonth])

  return (
    <InvoicesProvider onSendInvoice={onSendInvoice}>
      <View title={stringOverrides?.title || 'Invoices'} showHeader={showTitle}>
        <GlobalMonthPicker />
        <UnifiedReport />
      </View>
    </InvoicesProvider>
  )
}

const InvoicesContent = () => {
  const routeState = useInvoiceRouteState()

  return routeState.route === InvoiceRoute.Detail
    ? <InvoiceDetail />
    : <InvoiceOverview />
}
